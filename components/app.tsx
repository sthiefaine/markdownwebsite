"use client";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import {
  ArrowRight,
  Search,
  XCircle,
  Trash,
  Bold,
  BookOpenCheck,
  Box,
  House,
  ClipboardCopy,
} from "lucide-react";
import { useId } from "react";
import { Header } from "@/components/Header/Header";
import Image from "next/image";
import { boldFirstLetters } from "@/helpers/texts";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollBar, ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export function App() {
  const id = useId();
  const [url, setUrl] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [markdownTransformed, setMarkdownTransformed] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleClearUrl = () => {
    setUrl("");
  };

  const handleClean = () => {
    setError("");
    setMarkdown("");
    setMarkdownTransformed("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleConvertToMarkdown();
    }
  };

  useEffect(() => {
    const urlName = searchParams.get("url");
    if (urlName && typeof urlName === "string" && !url) {
      setUrl(urlName);
      handleConvertToMarkdown(urlName);
    }
  }, []);

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handlePasteAndGenerate = async () => {
    setLoading(true);
    setError("");
    const newLink = (await navigator.clipboard?.readText()) || null;

    if (!newLink) {
      setError("Clipboard is empty.");
      setLoading(false);
      return;
    }

    if (!isValidUrl(newLink)) {
      setError("The clipboard content is not a valid URL.");
      setLoading(false);
      return;
    }

    setUrl(newLink);
    handleConvertToMarkdown(newLink);
  };

  const handleNavigation = (url: string) => {
    const linkSanitized = url.trim();
    router.replace(`?url=${linkSanitized}`);
  };

  const handleConvertToMarkdown = async (newLink?: string) => {
    const linkSanitized = newLink ?? url;
    if (!linkSanitized.trim()) {
      setError("");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/markdown", {
        method: "POST",
        body: JSON.stringify({ url: newLink ?? url }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch markdown from the server.");
      }

      const data = await response.json();

      if (data.success) {
        setMarkdown(data.data);
      } else {
        throw new Error("Error generating markdown.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
      handleNavigation(url);
    }
  };

  const handleCopyLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    setCopied(true);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Markdown website",
        text: "Convert your website to Markdown",
        url: window.location.href,
      });
    }
  };

  return (
    <>
      <div className={`max-w-3xl mx-auto p-1  }`}>
        <Header />

        {/* Input Section */}
        <div className="mt-6 space-y-4">
          <Label htmlFor={id} hidden>
            Convert a website to Markdown
          </Label>
          <div className="relative">
            <Input
              id={id}
              className="pe-12 ps-9 border-black dark:border-gray-50 "
              placeholder="Paste the link here"
              type="url"
              value={url}
              onChange={handleUrlChange}
              onKeyDown={handleKeyDown}
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
              <Search size={16} strokeWidth={2} />
            </div>
            <button
              className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
              aria-label="Clear URL"
              onClick={handleClearUrl}
              type="button"
            >
              <XCircle size={16} strokeWidth={2} aria-hidden="true" />
            </button>
            <button
              className="absolute inset-y-0 end-5 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
              aria-label="Clear URL"
              onClick={() => handleConvertToMarkdown()}
              type="button"
            >
              <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>

          <div className="flex justify-center">
            <Button
              className="w-1/2 m-2 test"
              aria-label="Paste and Generate Markdown"
              onClick={handlePasteAndGenerate}
              disabled={loading}
            >
              📋 Paste and Generate
            </Button>
            <Button
              className="w-1/2 m-2"
              aria-label="Generate Markdown"
              onClick={() => handleConvertToMarkdown()}
              disabled={loading || !isValidUrl(url)}
            >
              {" "}
              <BookOpenCheck
                className="-ms-1 me-2"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              Generate
            </Button>
          </div>
        </div>

        {!markdown && (
          <div className="mt-6 w-full flex justify-center">
            <Image
              src="/taupe.png"
              alt="avatar"
              width={500}
              height={500}
              className="rounded-lg"
            />
          </div>
        )}

        {/* Error Section */}
        {error && (
          <div className="mt-4 p-4 rounded bg-red-50 text-red-700 border border-red-200">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="w-full flex flex-col mt-6 text-center">
            <Progress value={70} className="w-full" />
            <p className="mt-4  text-blue-500">Loading...</p>
          </div>
        )}
        {markdown && (
          <div className="mt-6">
            <Tabs className="w-full" defaultValue="tab-1">
              <ScrollArea className="w-full">
                <TabsList className="w-full mb-3 h-auto -space-x-px bg-background p-0 shadow-sm shadow-black/5 rtl:space-x-reverse">
                  <TabsTrigger
                    value="tab-1"
                    className="w-1/3 relative overflow-hidden rounded-none border border-border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
                  >
                    <House
                      className="-ms-0.5 me-1.5 opacity-60"
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="tab-2"
                    className="w-1/3 relative overflow-hidden rounded-none border border-border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
                    onClick={() =>
                      setMarkdownTransformed(boldFirstLetters(markdown))
                    }
                  >
                    <Bold
                      className="-ms-0.5 me-1.5 opacity-60"
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    Speed
                  </TabsTrigger>
                  <TabsTrigger
                    value="tab-3"
                    disabled
                    className="w-1/3 disabled:opacity-50 relative overflow-hidden rounded-none border border-border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
                  >
                    <Box
                      className="-ms-0.5 me-1.5 opacity-60"
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    Speed IA
                  </TabsTrigger>
                </TabsList>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
              <TabsContent value="tab-1">
                <div className="markdown-body bg-gray-100 dark:bg-gray-900 p-4 rounded">
                  <div
                    id="action-buttons"
                    className="flex justify-end space-x-5"
                  >
                    <Button variant="destructive" onClick={() => handleClean()}>
                      <Trash
                        className="-ms-1 me-2"
                        size={16}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      Clean
                    </Button>
                    <Button variant="outline" onClick={() => handleCopyLink()}>
                      <ClipboardCopy
                        className="-ms-1 me-2"
                        size={16}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      Copy Link
                    </Button>
                    <Button variant="outline" onClick={() => handleShare()}>
                      <Box
                        className="-ms-1 me-2"
                        size={16}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      Share
                    </Button>
                  </div>
                  <ReactMarkdown
                    // eslint-disable-next-line react/no-children-prop
                    children={markdown}
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  />
                </div>
              </TabsContent>
              <TabsContent value="tab-2">
                <div className="markdown-body bg-gray-100 dark:bg-gray-900 p-4 rounded">
                  <ReactMarkdown
                    // eslint-disable-next-line react/no-children-prop
                    children={markdownTransformed}
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  />
                </div>
              </TabsContent>
              <TabsContent value="tab-3">
                <div className="markdown-body bg-gray-100 dark:bg-gray-900 p-4 rounded">
                  <ReactMarkdown
                    // eslint-disable-next-line react/no-children-prop
                    children="## Under construction ##"
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
        <footer className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Made with ❤️ by{" "}
            <a href="https://github.com/sthiefaine" className="text-blue-500">
              thiefaine
            </a>
          </p>
        </footer>
      </div>
    </>
  );
}
