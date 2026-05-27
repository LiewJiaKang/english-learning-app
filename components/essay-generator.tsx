"use client";

import { useState } from "react";
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import WordLengthSlider from "./word-length-slider"
import { Spinner } from "./ui/spinner";
import EssayOutput from "./essay-output";
import { Skeleton } from "./ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ChevronsLeftRightIcon } from "lucide-react";

export default function EssayGenerator() {
    const themes = [
        "People", "Science and technology", "Shopping", "Environment", "Sports", "Social media", "Holiday", "Crimes/Horror/Tregedy/Mystery"
    ]
    const essayTypes = [
        "Article", "Narrative", "Review", "Report"
    ]

    const [title, setTitle] = useState("");
    const [theme, setTheme] = useState("");
    const [level, setLevel] = useState("");
    const [essayType, setEssayType] = useState("");
    const [length, setLength] = useState(800);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");

    const handleGenerate = async () => {
        if (!title.trim()) {
            console.log("Title is required.");
            return;
        }
        if (!theme) {
            console.log("Theme is required.");
            return;
        }
        if (!level) {
            console.log("Level is required.");
            return;
        }
        if (!essayType) {
            console.log("Essay type is required.");
            return;
        }

        setLoading(true);
        setResult("");
        const res = await fetch("/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title,
                theme,
                level,
                essayType,
                length,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            setResult(data.error || "Something went wrong.");
        } else {
            setResult(data.result);
        }

        setLoading(false);
    };


    return (
        <div className="w-full flex flex-col md:flex-row gap-2 md:items-start">
            <Card>
                <Collapsible className="flex flex-col items-stretch md:items-end" defaultOpen>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:mx-2 -my-3 mx-auto">
                            <ChevronsLeftRightIcon className="md:rotate-0 rotate-90" size={16} />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="flex flex-col gap-2">
                            <Label>Essay Title</Label>
                            <Input placeholder="e.g. A Day That Changed Everything" className="mb-2 text-sm" onChange={(e) => setTitle(e.target.value)}></Input>
                            <Label>Theme</Label>
                            <Select onValueChange={(val) => setTheme(val)}>
                                <SelectTrigger className="w-full mb-2">
                                    <SelectValue placeholder="Select a theme" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {
                                            themes.map((x, i) => {
                                                return (<SelectItem key={i} value={x}>{x}</SelectItem>)
                                            })
                                        }
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <div className="flex gap-4 flex-col md:flex-row">
                                <div className="flex flex-col w-full gap-2">
                                    <Label>Level</Label>
                                    <Select onValueChange={(val) => setLevel(val)}>
                                        <SelectTrigger className="w-full md:w-40">
                                            <SelectValue placeholder="Select CEFR level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="B1">B1</SelectItem>
                                                <SelectItem value="B2">B2</SelectItem>
                                                <SelectItem value="C1">C1</SelectItem>
                                                <SelectItem value="C2">C2</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col w-full gap-2 mb-2">
                                    <Label>Essay Type</Label>
                                    <Select onValueChange={(val) => setEssayType(val)}>
                                        <SelectTrigger className="w-full md:w-40">
                                            <SelectValue placeholder="Select essay type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {
                                                    essayTypes.map((x, i) => {
                                                        return (<SelectItem value={x} key={i}>{x}</SelectItem>)
                                                    })
                                                }
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <WordLengthSlider value={length} setValue={setLength} />
                            <Button className="mt-4" onClick={handleGenerate} disabled={loading || !title.trim() || !theme || !level || !essayType}>Generate {loading && <Spinner data-icon="inline-start" />}</Button>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>
            <Card className="grow min-h-94">
                <CardHeader>
                    <CardTitle>{loading ? <Skeleton className="h-4 w-2/3 mb-2" /> : result.split("\n")[0].replaceAll("*", "")}</CardTitle>
                    <CardContent className="-mx-6">
                        {loading ?
                            <div className="flex flex-col gap-2 pt-4">
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-1/2" />
                                <Skeleton className="h-3 w-full" />
                                <span className="h-3 w-full" />
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-1/3" />
                                <Skeleton className="h-3 w-1/3" />
                            </div> :
                            <EssayOutput result={result.split("\n").slice(1).join("\n")} />
                        }
                    </CardContent>
                </CardHeader>
            </Card>
        </div>
    )
}
