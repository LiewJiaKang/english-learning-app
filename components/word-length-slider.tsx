"use client";

import { Slider } from "./ui/slider";
import { Label } from "./ui/label";

export default function WordLengthSlider({ value = 0, setValue = (value: number) => { } }) {
    return (
        <>
            <span className="flex justify-between">
                <Label>Length</Label>
                <p className="ml-2 text-md text-muted-foreground">
                    {value}
                </p>
            </span>
            <Slider defaultValue={[800]} min={600} max={1200} step={100} onValueChange={(val) => setValue(val[0])} />
        </>
    )
}
