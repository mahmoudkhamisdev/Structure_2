"use client"

import Color from "color"
import { PipetteIcon } from "lucide-react"
import * as Slider from "@radix-ui/react-slider"
import {
    type ComponentProps,
    createContext,
    type HTMLAttributes,
    memo,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface ColorPickerContextValue {
    hue: number
    saturation: number
    lightness: number
    alpha: number
    mode: string
    setHue: (hue: number) => void
    setSaturation: (saturation: number) => void
    setLightness: (lightness: number) => void
    setAlpha: (alpha: number) => void
    setMode: (mode: string) => void
}

const ColorPickerContext = createContext<ColorPickerContextValue | undefined>(undefined)

export const useColorPicker = () => {
    const context = useContext(ColorPickerContext)

    if (!context) {
        throw new Error("useColorPicker must be used within a ColorPickerProvider")
    }

    return context
}

const parseColorSafe = (val: any, fallback = "#3b82f6") => {
    try {
        if (val) return Color(val)
    } catch {}
    try {
        if (fallback) return Color(fallback)
    } catch {}
    return Color("#3b82f6")
}

export type ColorPickerProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
    value?: any
    defaultValue?: any
    onChange?: (value: string) => void
}

export const ColorPicker = ({
    value,
    defaultValue = "#3b82f6",
    onChange,
    className,
    ...props
}: ColorPickerProps) => {
    const initialColor = parseColorSafe(value, defaultValue)

    const [hue, setHue] = useState(initialColor.hue() || 0)
    const [saturation, setSaturation] = useState(initialColor.saturationl() || 100)
    const [lightness, setLightness] = useState(initialColor.lightness() || 50)
    const [alpha, setAlpha] = useState(Math.round(initialColor.alpha() * 100))
    const [mode, setMode] = useState("hex")

    const isUserActionRef = useRef(false)
    const isFirstRenderRef = useRef(true)

    const setHueAction = useCallback((h: number) => {
        isUserActionRef.current = true
        setHue(h)
    }, [])

    const setSaturationAction = useCallback((s: number) => {
        isUserActionRef.current = true
        setSaturation(s)
    }, [])

    const setLightnessAction = useCallback((l: number) => {
        isUserActionRef.current = true
        setLightness(l)
    }, [])

    const setAlphaAction = useCallback((a: number) => {
        isUserActionRef.current = true
        setAlpha(a)
    }, [])

    // Update color when controlled value changes from outside
    useEffect(() => {
        if (value) {
            try {
                const c = Color(value)
                isUserActionRef.current = false
                setHue(c.hue() || 0)
                setSaturation(c.saturationl() || 0)
                setLightness(c.lightness() || 0)
                setAlpha(Math.round(c.alpha() * 100))
            } catch {}
        }
    }, [value])

    // Notify parent ONLY when user deliberately interacts, NEVER on mount
    const lastEmittedRef = useRef<string>("")
    useEffect(() => {
        if (isFirstRenderRef.current) {
            isFirstRenderRef.current = false
            return
        }

        if (onChange && isUserActionRef.current) {
            isUserActionRef.current = false
            try {
                const color = Color.hsl(hue, saturation, lightness).alpha(alpha / 100)
                const hex = alpha < 100 ? color.hexa() : color.hex()
                if (hex !== lastEmittedRef.current) {
                    lastEmittedRef.current = hex
                    onChange(hex)
                }
            } catch {}
        }
    }, [hue, saturation, lightness, alpha, onChange])

    return (
        <ColorPickerContext.Provider
            value={{
                hue,
                saturation,
                lightness,
                alpha,
                mode,
                setHue: setHueAction,
                setSaturation: setSaturationAction,
                setLightness: setLightnessAction,
                setAlpha: setAlphaAction,
                setMode,
            }}
        >
            <div className={cn("flex size-full flex-col gap-3", className)} {...(props as any)} />
        </ColorPickerContext.Provider>
    )
}

export type ColorPickerSelectionProps = HTMLAttributes<HTMLDivElement>

export const ColorPickerSelection = memo(({ className, ...props }: ColorPickerSelectionProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const { hue, saturation, lightness, setSaturation, setLightness } = useColorPicker()

    // Calculate current position from saturation and lightness
    const [positionX, setPositionX] = useState(() => Math.max(0, Math.min(1, saturation / 100)))
    const [positionY, setPositionY] = useState(() => {
        const x = Math.max(0, Math.min(1, saturation / 100))
        const topLightness = x < 0.01 ? 100 : 50 + 50 * (1 - x)
        return topLightness > 0 ? Math.max(0, Math.min(1, 1 - lightness / topLightness)) : 0.5
    })

    // Sync position when not dragging
    useEffect(() => {
        if (!isDragging) {
            const x = Math.max(0, Math.min(1, saturation / 100))
            const topLightness = x < 0.01 ? 100 : 50 + 50 * (1 - x)
            const y = topLightness > 0 ? Math.max(0, Math.min(1, 1 - lightness / topLightness)) : 0.5
            setPositionX(x)
            setPositionY(y)
        }
    }, [saturation, lightness, isDragging])

    const backgroundGradient = useMemo(() => {
        return `linear-gradient(0deg, rgba(0,0,0,1), rgba(0,0,0,0)),
            linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,0)),
            hsl(${hue}, 100%, 50%)`
    }, [hue])

    const handlePointerMove = useCallback(
        (event: PointerEvent) => {
            if (!(isDragging && containerRef.current)) {
                return
            }
            const rect = containerRef.current.getBoundingClientRect()
            const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
            const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
            setPositionX(x)
            setPositionY(y)
            setSaturation(x * 100)
            const topLightness = x < 0.01 ? 100 : 50 + 50 * (1 - x)
            const lightnessVal = topLightness * (1 - y)

            setLightness(lightnessVal)
        },
        [isDragging, setSaturation, setLightness],
    )

    useEffect(() => {
        const handlePointerUp = () => setIsDragging(false)

        if (isDragging) {
            window.addEventListener("pointermove", handlePointerMove)
            window.addEventListener("pointerup", handlePointerUp)
        }

        return () => {
            window.removeEventListener("pointermove", handlePointerMove)
            window.removeEventListener("pointerup", handlePointerUp)
        }
    }, [isDragging, handlePointerMove])

    return (
        <div
            className={cn("relative size-full cursor-crosshair rounded select-none", className)}
            onPointerDown={e => {
                e.preventDefault()
                e.stopPropagation()
                setIsDragging(true)
                const rect = e.currentTarget.getBoundingClientRect()
                const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
                const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
                setPositionX(x)
                setPositionY(y)
                setSaturation(x * 100)
                const topLightness = x < 0.01 ? 100 : 50 + 50 * (1 - x)
                setLightness(topLightness * (1 - y))
            }}
            ref={containerRef}
            style={{
                background: backgroundGradient,
            }}
            {...(props as any)}
        >
            <div
                className="-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute h-4 w-4 rounded-full border-2 border-white shadow-sm"
                style={{
                    left: `${positionX * 100}%`,
                    top: `${positionY * 100}%`,
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.6)",
                }}
            />
        </div>
    )
})

ColorPickerSelection.displayName = "ColorPickerSelection"

export type ColorPickerHueProps = ComponentProps<typeof Slider.Root>

export const ColorPickerHue = ({ className, ...props }: ColorPickerHueProps) => {
    const { hue, setHue } = useColorPicker()

    return (
        <Slider.Root
            className={cn("relative flex h-4 w-full touch-none select-none items-center", className)}
            max={360}
            onValueChange={([val]: number[]) => setHue(val)}
            step={1}
            value={[hue]}
            {...(props as any)}
        >
            <Slider.Track className="relative my-0.5 h-3 w-full grow rounded-full bg-[linear-gradient(90deg,#FF0000,#FFFF00,#00FF00,#00FFFF,#0000FF,#FF00FF,#FF0000)]">
                <Slider.Range className="absolute h-full" />
            </Slider.Track>
            <Slider.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer" />
        </Slider.Root>
    )
}

export type ColorPickerAlphaProps = ComponentProps<typeof Slider.Root>

export const ColorPickerAlpha = ({ className, ...props }: ColorPickerAlphaProps) => {
    const { alpha, setAlpha } = useColorPicker()

    return (
        <Slider.Root
            className={cn("relative flex h-4 w-full touch-none select-none items-center", className)}
            max={100}
            onValueChange={([val]: number[]) => setAlpha(val)}
            step={1}
            value={[alpha]}
            {...(props as any)}
        >
            <Slider.Track
                className="relative my-0.5 h-3 w-full grow rounded-full"
                style={{
                    background:
                        'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==") left center',
                }}
            >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent to-black/50" />
                <Slider.Range className="absolute h-full rounded-full bg-transparent" />
            </Slider.Track>
            <Slider.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer" />
        </Slider.Root>
    )
}

export type ColorPickerEyeDropperProps = ComponentProps<typeof Button>

export const ColorPickerEyeDropper = ({ className, ...props }: ColorPickerEyeDropperProps) => {
    const { setHue, setSaturation, setLightness, setAlpha } = useColorPicker()

    const handleEyeDropper = async () => {
        try {
            // @ts-expect-error - EyeDropper API is experimental
            const eyeDropper = new EyeDropper()
            const result = await eyeDropper.open()
            const color = Color(result.sRGBHex)

            setHue(color.hue() || 0)
            setSaturation(color.saturationl() || 0)
            setLightness(color.lightness() || 0)
            setAlpha(100)
        } catch (error) {
            console.error("EyeDropper failed:", error)
        }
    }

    return (
        <Button
            className={cn("shrink-0 text-muted-foreground", className)}
            onClick={handleEyeDropper}
            size="icon"
            type="button"
            variant="outline"
            {...(props as any)}
        >
            <PipetteIcon size={16} />
        </Button>
    )
}

export type ColorPickerOutputProps = ComponentProps<typeof SelectTrigger>

const formats = ["hex", "rgb", "css", "hsl"]

export const ColorPickerOutput = ({ className, ...props }: ColorPickerOutputProps) => {
    const { mode, setMode } = useColorPicker()

    return (
        <Select onValueChange={(val: string | null) => { if (val) setMode(val); }} value={mode}>
            <SelectTrigger className="h-8 w-20 shrink-0 text-xs" {...(props as any)}>
                <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
                {formats.map(format => (
                    <SelectItem className="text-xs" key={format} value={format}>
                        {format.toUpperCase()}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

type PercentageInputProps = ComponentProps<typeof Input>

const PercentageInput = ({ className, ...props }: PercentageInputProps) => {
    return (
        <div className="relative">
            <Input
                readOnly
                type="text"
                {...(props as any)}
                className={cn(
                    "h-8 w-[3.25rem] rounded-l-none bg-secondary px-2 text-xs shadow-none",
                    className,
                )}
            />
            <span className="-translate-y-1/2 absolute top-1/2 right-2 text-muted-foreground text-xs">
                %
            </span>
        </div>
    )
}

export type ColorPickerFormatProps = HTMLAttributes<HTMLDivElement>

export const ColorPickerFormat = ({ className, ...props }: ColorPickerFormatProps) => {
    const { hue, saturation, lightness, alpha, mode } = useColorPicker()
    const color = Color.hsl(hue, saturation, lightness, alpha / 100)

    if (mode === "hex") {
        const hex = color.hex()

        return (
            <div
                className={cn(
                    "-space-x-px relative flex w-full items-center rounded-md shadow-sm",
                    className,
                )}
                {...(props as any)}
            >
                <Input
                    className="h-8 rounded-r-none bg-secondary px-2 text-xs shadow-none"
                    readOnly
                    type="text"
                    value={hex}
                />
                <PercentageInput value={alpha} />
            </div>
        )
    }

    if (mode === "rgb") {
        const rgb = color
            .rgb()
            .array()
            .map((value: number) => Math.round(value))

        return (
            <div
                className={cn("-space-x-px flex items-center rounded-md shadow-sm", className)}
                {...(props as any)}
            >
                {rgb.map((value: number, index: number) => (
                    <Input
                        className={cn(
                            "h-8 rounded-r-none bg-secondary px-2 text-xs shadow-none",
                            index && "rounded-l-none",
                            className,
                        )}
                        key={index}
                        readOnly
                        type="text"
                        value={value}
                    />
                ))}
                <PercentageInput value={alpha} />
            </div>
        )
    }

    if (mode === "css") {
        const rgb = color
            .rgb()
            .array()
            .map((value: number) => Math.round(value))

        return (
            <div className={cn("w-full rounded-md shadow-sm", className)} {...(props as any)}>
                <Input
                    className="h-8 w-full bg-secondary px-2 text-xs shadow-none"
                    readOnly
                    type="text"
                    value={`rgba(${rgb.join(", ")}, ${alpha}%)`}
                    {...(props as any)}
                />
            </div>
        )
    }

    if (mode === "hsl") {
        const hsl = color
            .hsl()
            .array()
            .map((value: number) => Math.round(value))

        return (
            <div
                className={cn("-space-x-px flex items-center rounded-md shadow-sm", className)}
                {...(props as any)}
            >
                {hsl.map((value: number, index: number) => (
                    <Input
                        className={cn(
                            "h-8 rounded-r-none bg-secondary px-2 text-xs shadow-none",
                            index && "rounded-l-none",
                            className,
                        )}
                        key={index}
                        readOnly
                        type="text"
                        value={value}
                    />
                ))}
                <PercentageInput value={alpha} />
            </div>
        )
    }

    return null
}
