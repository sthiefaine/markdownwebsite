import { NextRequest, NextResponse } from "next/server";
import TurndownService from "turndown";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

const userAgents = {
  googlebotDesktop: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  googlebotMobile: "Chrome/115.0.5790.171 Mobile Safari/537.36 (compatible ; Googlebot/2.1 ; +http://www.google.com/bot.html)",
  bingbotDesktop: "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
  bingbotMobile: "Chrome/115.0.5790.171 Mobile Safari/537.36 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
  facebookExternal: "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"
};


const elementsToRemove = [
  "script", "style", ".hidden", ".adpos", ".logo-premium", ".offer-container", 
  ".inread-container", ".inread-title", ".inread-body", ".inread-footer", 
  ".prefix", ".buttons", '[class^="restricted-"]',
];

function cleanHtmlContent(htmlContent : string) {
  const dom = new JSDOM(htmlContent);
  const { document } = dom.window;

  elementsToRemove.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => el.remove());
  });

  return document;
}

function extractArticleContent(htmlContent : string) {
  const document = cleanHtmlContent(htmlContent);

  const article = document.querySelector("article") as HTMLElement;
  const turndownService = new TurndownService();

  turndownService.addRule("disableLinks", {
    filter: "a", // Cible les balises <a>
    replacement: function (content) {
      return content; // Conserve uniquement le texte, supprime le lien
    },
  });


  if(!article){
    return turndownService.turndown(document);
  }else{

    return turndownService.turndown(article);
  }


}

async function handleBasicRequest(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.5790.171 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.statusText}`);
  }
  const htmlContent = await response.text();
  const dom = new JSDOM(htmlContent, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article || !article.content) {
    return NextResponse.json(
      { success: false, message: "Failed to extract the main content." },
      { status: 400 }
    );
  }

  const result = extractArticleContent(article.content);
  return result
}

async function handleLeMondeRequest(url: string) {
  const getID = url.match(/_(\d+)_\d+\.html$/);
  if (getID) {
    const articleID = getID[1];
    const response = await fetch(`https://apps.lemonde.fr/aec/v1/premium-android-phone/article/${articleID}`, {
      headers: {
        "User-Agent": userAgents.bingbotMobile,
        Accept: "json, text/plain, */*"
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const data = await response.json();
    return extractArticleContent(data.template_vars.content);
  }
  return null;
}

// Fonction principale pour traiter la requête
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body.url;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, message: "Invalid or missing URL." },
        { status: 400 }
      );
    }

    const matchDomain = url.match(/https?:\/\/(?:www\.)?([^\/]+)/);
    let result;

    if (matchDomain) {
      if (matchDomain[1] === "lemonde.fr") {
        result = await handleLeMondeRequest(url);
        if (!result) {
          result =await handleBasicRequest(url);
        }
      }
    }

    if (!result) {
      result = await handleBasicRequest(url);
    }

    return NextResponse.json(
      {
        success: true,
        message: "HTML successfully converted to Markdown.",
        data: result,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
