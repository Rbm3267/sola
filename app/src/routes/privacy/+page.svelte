<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
</script>

<svelte:head>
  <title>Privacy Policy — Sola & Sola Browser Extension</title>
  <meta name="description" content="Official Privacy Policy for Sola and the Sola Chrome Extension (View in My UI)." />
</svelte:head>

<div class="flex flex-col w-full">
  <Navbar />

  <main class="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
    <!-- Header -->
    <div class="border-b border-slate-200/80 pb-8 mb-10 dark:border-white/5">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20/80 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold mb-3">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span>Official Privacy Policy</span>
      </div>
      <h1 class="text-3xl sm:text-5xl font-black text-slate-950 tracking-[-0.03em]">
        Privacy Policy
      </h1>
      <p class="text-slate-500 text-xs sm:text-sm font-mono mt-2">
        Last updated: August 28, 2026 • Applicable to Sola Platform and Sola Chrome Extension ("View in My UI")
      </p>
    </div>

    <!-- Content Sections -->
    <div class="space-y-10 text-slate-700 text-sm sm:text-base leading-relaxed">
      
      <!-- Summary Box -->
      <div class="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-500/10/50 border border-emerald-200 dark:border-emerald-500/20/80 space-y-2">
        <h2 class="font-bold text-slate-950 text-base">Key Privacy Highlights</h2>
        <ul class="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-700">
          <li><strong>Zero Data Collection:</strong> Sola does not collect, record, log, or transmit your personal data, passwords, browsing history, or website content.</li>
          <li><strong>Client-Side Execution:</strong> All component simulations, intent parsing, and Shadow DOM rendering occur locally on your machine.</li>
          <li><strong>No Data Sales:</strong> We do not sell, rent, monetize, or transfer your information to data brokers, advertisers, or third parties.</li>
          <li><strong>Zero Remote Egress:</strong> Component state is kept entirely in your browser's local memory and `chrome.storage.local`.</li>
        </ul>
      </div>

      <!-- 1. Information We Collect -->
      <section class="space-y-3">
        <h2 class="text-xl font-bold text-slate-950 tracking-tight">1. Information We Collect</h2>
        <p>
          The Sola platform and the Sola Chrome Extension are engineered with a strict <strong>Zero-Egress Data Architecture</strong>. 
        </p>
        <p>
          We do not collect, process, or transmit:
        </p>
        <ul class="list-disc list-inside pl-2 space-y-1 text-slate-600 text-sm">
          <li>Personally Identifiable Information (such as name, email, address, or phone number).</li>
          <li>Web browsing history, keystrokes, form inputs, or search queries on visited websites.</li>
          <li>Authentication tokens, cookies, session credentials, or financial data.</li>
          <li>IP addresses, hardware fingerprints, or persistent tracking identifiers.</li>
        </ul>
      </section>

      <!-- 2. Local Device Storage -->
      <section class="space-y-3">
        <h2 class="text-xl font-bold text-slate-950 tracking-tight">2. Local Device Storage</h2>
        <p>
          The extension utilizes the Chrome <code class="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-xs text-slate-800 dark:text-slate-200">storage.local</code> API exclusively to save your customized preferences locally on your device. This includes:
        </p>
        <ul class="list-disc list-inside pl-2 space-y-1 text-slate-600 text-sm">
          <li>User interface layout configurations (e.g., active canvas cards, column width preferences).</li>
          <li>Selected visual themes (Light / Dark mode).</li>
          <li>Locally created component templates and draft widgets.</li>
        </ul>
        <p class="text-xs text-slate-500">
          This data remains solely on your local hard drive and is never uploaded to any remote server.
        </p>
      </section>

      <!-- 3. Permissions & Justifications -->
      <section class="space-y-4">
        <h2 class="text-xl font-bold text-slate-950 tracking-tight">3. Chrome Extension Permissions & Justifications</h2>
        <p>
          The Sola Chrome Extension declares minimal permissions in its <code class="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-xs text-slate-800 dark:text-slate-200">manifest.json</code> strictly necessary for core sandbox functionality:
        </p>

        <div class="divide-y divide-slate-200 border border-slate-200/90 rounded-2xl overflow-hidden bg-white dark:bg-[#0f172a] dark:border-white/5">
          <div class="p-4 space-y-1">
            <div class="flex items-center gap-2">
              <span class="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded">activeTab</span>
              <span class="text-xs font-semibold text-slate-900 dark:text-slate-100">Current Tab Access</span>
            </div>
            <p class="text-xs text-slate-600">
              <strong>Purpose:</strong> Allows the extension to mount the Sola component preview overlay on the current active tab when you explicitly trigger the action.
            </p>
          </div>

          <div class="p-4 space-y-1">
            <div class="flex items-center gap-2">
              <span class="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded">storage</span>
              <span class="text-xs font-semibold text-slate-900 dark:text-slate-100">Local Configuration Storage</span>
            </div>
            <p class="text-xs text-slate-600">
              <strong>Purpose:</strong> Saves your customized studio component layouts and theme choices on your local machine using <code class="font-mono">chrome.storage.local</code>.
            </p>
          </div>

          <div class="p-4 space-y-1">
            <div class="flex items-center gap-2">
              <span class="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded">sidePanel</span>
              <span class="text-xs font-semibold text-slate-900 dark:text-slate-100">Chrome Side Panel Integration</span>
            </div>
            <p class="text-xs text-slate-600">
              <strong>Purpose:</strong> Provides a dedicated side panel where you can browse your Sola component library and drag widgets directly onto your sandbox.
            </p>
          </div>

          <div class="p-4 space-y-1">
            <div class="flex items-center gap-2">
              <span class="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded">host_permissions (&lt;all_urls&gt;)</span>
              <span class="text-xs font-semibold text-slate-900 dark:text-slate-100">Universal Host Sandbox Preview</span>
            </div>
            <p class="text-xs text-slate-600">
              <strong>Purpose:</strong> Enables developers to preview UI components on any development environment (e.g. <code class="font-mono">localhost:3000</code>, <code class="font-mono">localhost:5173</code>) and web applications inside an isolated, closed Shadow DOM boundary.
            </p>
          </div>
        </div>
      </section>

      <!-- 4. Single Purpose & Limited Use Disclosure -->
      <section class="space-y-3">
        <h2 class="text-xl font-bold text-slate-950 tracking-tight">4. Google Chrome Web Store Limited Use Compliance</h2>
        <p>
          Sola's use and transfer of information received from Google APIs to any other app adheres to the <a href="https://developer.chrome.com/docs/webstore/program-policies/" target="_blank" rel="noreferrer" class="text-emerald-700 dark:text-emerald-400 underline font-semibold">Chrome Web Store User Data Policy</a>, including the Limited Use requirements.
        </p>
        <p>Specifically, we declare that:</p>
        <ul class="list-disc list-inside pl-2 space-y-1 text-slate-600 text-sm">
          <li>We do NOT transfer user data for personalized advertising or marketing.</li>
          <li>We do NOT sell user data to any third party, broker, or marketplace.</li>
          <li>We do NOT use or transfer user data for determining creditworthiness or for lending purposes.</li>
          <li>Human employees or contractors are not permitted to read your user data.</li>
        </ul>
      </section>

      <!-- 5. Security & Isolation -->
      <section class="space-y-3">
        <h2 class="text-xl font-bold text-slate-950 tracking-tight">5. Security & Closed Shadow DOM Isolation</h2>
        <p>
          To protect both your host applications and Sola components, all overlays are encapsulated inside a <strong>Closed Shadow DOM root</strong>. This ensures:
        </p>
        <ul class="list-disc list-inside pl-2 space-y-1 text-slate-600 text-sm">
          <li>Complete CSS style isolation: Host application styles cannot break Sola components, and Sola styles cannot bleed into the host.</li>
          <li>Complete JavaScript sandboxing: Sola components cannot access host DOM variables, global states, or scripts.</li>
        </ul>
      </section>

      <!-- 6. Changes & Contact -->
      <section class="space-y-3 border-t border-slate-200/80 pt-6 dark:border-white/5">
        <h2 class="text-xl font-bold text-slate-950 tracking-tight">6. Contact & Inquiries</h2>
        <p>
          If you have any questions, inquiries, or privacy requests regarding this Privacy Policy or our software, please contact:
        </p>
        <div class="p-4 rounded-2xl bg-white border border-slate-200/90 font-mono text-xs space-y-1 text-slate-800 dark:bg-[#0f172a] dark:text-slate-200 dark:border-white/5">
          <div><strong>Product:</strong> Sola (Ambient Intent Runtime)</div>
          <div><strong>Website:</strong> <a href="https://www.sola-air.dev" class="text-emerald-700 dark:text-emerald-400 underline">https://www.sola-air.dev</a></div>
          <div><strong>Developer Contact:</strong> support@sola-air.dev</div>
        </div>
      </section>

    </div>
  </main>
</div>
