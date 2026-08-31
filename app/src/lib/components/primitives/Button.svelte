<script lang="ts">
  import type { Snippet } from "svelte";
  
  let {
    variant = "primary",
    size = "md",
    color = "emerald",
    radius = "md",
    loading = false,
    disabled = false,
    fluid = false,
    class: className = "",
    type = "button",
    onclick,
    children,
    iconLeft,
    iconRight
  } = $props<{
    variant?: "primary" | "secondary" | "outline" | "ghost" | "glass";
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    color?: "emerald" | "sky" | "amber" | "rose" | "indigo" | "slate";
    radius?: "none" | "sm" | "md" | "lg" | "full";
    loading?: boolean;
    disabled?: boolean;
    fluid?: boolean;
    class?: string;
    type?: "button" | "submit" | "reset";
    onclick?: (e: MouseEvent) => void;
    children?: Snippet;
    iconLeft?: Snippet;
    iconRight?: Snippet;
  }>();

  const sizeClasses = {
    xs: "px-2.5 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
    xl: "px-6 py-3 text-lg"
  };

  const radiusClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-xl",
    full: "rounded-full"
  };

  // Explicit mappings for UnoCSS static extraction
  const colorMaps = {
    emerald: {
      primary: "bg-blue-500 hover:bg-blue-400 text-white dark:bg-blue-600 dark:hover:bg-blue-500",
      secondary: "bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-300",
      outline: "bg-transparent hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
      ghost: "bg-transparent hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-transparent",
      ring: "focus:ring-blue-500/50"
    },
    sky: {
      primary: "bg-sky-500 hover:bg-sky-400 text-white dark:bg-sky-600 dark:hover:bg-sky-500",
      secondary: "bg-sky-50 hover:bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:hover:bg-sky-500/20 dark:text-sky-300",
      outline: "bg-transparent hover:bg-sky-50 dark:hover:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-500/30",
      ghost: "bg-transparent hover:bg-sky-50 dark:hover:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-transparent",
      ring: "focus:ring-sky-500/50"
    },
    amber: {
      primary: "bg-amber-500 hover:bg-amber-400 text-white dark:bg-amber-600 dark:hover:bg-amber-500",
      secondary: "bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:text-amber-300",
      outline: "bg-transparent hover:bg-amber-50 dark:hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
      ghost: "bg-transparent hover:bg-amber-50 dark:hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-transparent",
      ring: "focus:ring-amber-500/50"
    },
    rose: {
      primary: "bg-rose-500 hover:bg-rose-400 text-white dark:bg-rose-600 dark:hover:bg-rose-500",
      secondary: "bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-300",
      outline: "bg-transparent hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30",
      ghost: "bg-transparent hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-transparent",
      ring: "focus:ring-rose-500/50"
    },
    indigo: {
      primary: "bg-indigo-500 hover:bg-indigo-400 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500",
      secondary: "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-300",
      outline: "bg-transparent hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30",
      ghost: "bg-transparent hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-transparent",
      ring: "focus:ring-indigo-500/50"
    },
    slate: {
      primary: "bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-200 dark:hover:bg-white dark:text-slate-900",
      secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200",
      outline: "bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600",
      ghost: "bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent",
      ring: "focus:ring-slate-500/50"
    }
  };

  const getVariantClasses = () => {
    if (variant === "glass") {
      return `bg-white/10 dark:bg-white/5 backdrop-blur-md hover:bg-white/20 dark:hover:bg-white/10 text-slate-800 dark:text-white border border-white/20 dark:border-white/10 shadow-sm`;
    }
    const map = colorMaps[color];
    const baseBorder = (variant === "primary" || variant === "secondary") ? "border border-transparent" : "border";
    return `${map[variant]} ${baseBorder}`;
  };

</script>

<button
  type={type}
  {disabled}
  class="
    inline-flex items-center justify-center gap-2 font-mono font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-[#090d19]
    {sizeClasses[size]} {radiusClasses[radius]} {getVariantClasses()} {colorMaps[color].ring}
    {fluid ? "w-full" : ""}
    {disabled || loading ? "opacity-60 cursor-not-allowed saturate-50" : "active:scale-[0.98] cursor-pointer"}
    {className}
  "
  onclick={(e) => {
    if (!disabled && !loading && onclick) {
      onclick(e);
    }
  }}
>
  {#if loading}
    <svg class="w-4 h-4 animate-spin -ml-1" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  {:else if iconLeft}
    {@render iconLeft()}
  {/if}
  
  {#if children}
    <span>{@render children()}</span>
  {/if}

  {#if iconRight && !loading}
    {@render iconRight()}
  {/if}
</button>

