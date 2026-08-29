<script lang="ts">
  import type { Snippet } from "svelte";
  
  let {
    variant = "soft",
    color = "slate",
    size = "md",
    radius = "full",
    class: className = "",
    children,
    icon
  } = $props<{
    variant?: "solid" | "soft" | "outline" | "glass";
    color?: "emerald" | "sky" | "amber" | "rose" | "indigo" | "slate";
    size?: "sm" | "md" | "lg";
    radius?: "sm" | "md" | "lg" | "full";
    class?: string;
    children?: Snippet;
    icon?: Snippet;
  }>();

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-[9px]",
    md: "px-2.5 py-0.5 text-[10px]",
    lg: "px-3 py-1 text-xs"
  };

  const radiusClasses = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full"
  };

  const colorMaps = {
    emerald: {
      solid: "bg-emerald-500 text-white dark:bg-emerald-600",
      soft: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
      outline: "bg-transparent text-emerald-600 border-emerald-300 dark:text-emerald-400 dark:border-emerald-500/40"
    },
    sky: {
      solid: "bg-sky-500 text-white dark:bg-sky-600",
      soft: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
      outline: "bg-transparent text-sky-600 border-sky-300 dark:text-sky-400 dark:border-sky-500/40"
    },
    amber: {
      solid: "bg-amber-500 text-white dark:bg-amber-600",
      soft: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
      outline: "bg-transparent text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-500/40"
    },
    rose: {
      solid: "bg-rose-500 text-white dark:bg-rose-600",
      soft: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
      outline: "bg-transparent text-rose-600 border-rose-300 dark:text-rose-400 dark:border-rose-500/40"
    },
    indigo: {
      solid: "bg-indigo-500 text-white dark:bg-indigo-600",
      soft: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
      outline: "bg-transparent text-indigo-600 border-indigo-300 dark:text-indigo-400 dark:border-indigo-500/40"
    },
    slate: {
      solid: "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900",
      soft: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
      outline: "bg-transparent text-slate-600 border-slate-300 dark:text-slate-400 dark:border-slate-600"
    }
  };

  const getVariantClasses = () => {
    if (variant === "glass") {
      return "bg-white/20 dark:bg-white/5 backdrop-blur-md text-slate-800 dark:text-white border border-white/20 dark:border-white/10";
    }
    const map = colorMaps[color];
    const border = variant === "solid" ? "border border-transparent" : "border";
    return `${map[variant]} ${border}`;
  };

</script>

<span class="inline-flex items-center gap-1.5 font-mono font-bold uppercase tracking-wider {sizeClasses[size]} {radiusClasses[radius]} {getVariantClasses()} {className}">
  {#if icon}
    {@render icon()}
  {/if}
  {#if children}
    {@render children()}
  {/if}
</span>

