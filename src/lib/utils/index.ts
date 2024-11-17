import type { AstroGlobal } from "astro"
import type { AstroComponentFactory } from "astro/runtime/server/index.js"

export const makeUrlSafe = (str: string) => {
    return str.replaceAll("/", "<bs>").replaceAll(".", "<dot>").replaceAll(" ", "<spc>")
}
export const makeUrlUnSafe = (str: string) => {
    return str.replaceAll("<bs>", "/").replaceAll("<dot>", ".").replaceAll("<spc>", " ")
}

export const getFileParam = (Astro: Readonly<AstroGlobal<Record<string, any>, AstroComponentFactory, Record<string, string | undefined>>>) => {
    const rawFile = Astro.url.searchParams.get("file");
    if (rawFile) {
        return makeUrlUnSafe(rawFile)
    }
    else {
        return undefined
    }
}
export const getPathParam = (Astro: Readonly<AstroGlobal<Record<string, any>, AstroComponentFactory, Record<string, string | undefined>>>): string[] => {
    const raw = Astro.url.searchParams.getAll("path");

    if (raw) {
        return raw
    }
    else {
        return []
    }
}


export const toBinary = (str: string) => {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode(parseInt(p1, 16))
    }))
}

export const fromBinary = (str: string) => {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
}
