<script lang="ts">
    // This will be removed and adapted in later development
    // Needed to hardcode example data for the grid
    import { patients, screeningForms, pregroupForms, sessionForms, postgroupForms, sessionDates} from "./mockPatients";
    import { API_BASE, MAX } from "./constants";
    import { onMount } from "svelte";

    onMount( async () => {
        const token = localStorage.getItem("authToken");

        if (!token) {
        //errorMsg = "Not authenticated.";
        //loading = false;
        console.log('Not authenticated'); // will need to do not authenticated logic here
        }

        try {
            const therapistId = localStorage.getItem("userId");
            const FETCH_URL = `${API_BASE}/patientData/therapist/${therapistId}`;

            const groupOverviewRes = await fetch(FETCH_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const groupOverviewData = groupOverviewRes.json()
            console.log(groupOverviewData);
            console.log("Done.") // for testing purposes

        } catch (err) {
            console.error(err);
        }
    });

    export  const sessionCol: string[] = [];

    // set the sessionCol value
    let sessionCell = sessionForms.join("/")
    sessionDates.forEach(d => {
        sessionCol.push(sessionCell)
    });

    // might not need this
    const totalCol = [].concat(screeningForms, pregroupForms, sessionCol, postgroupForms)


    export const bottomCol = ["Pre-group"].concat(sessionDates, "Post-group")


    // will go in another file later
    function colorFor(form: string, score: number) {
        const max = MAX[form]; // all forms implemented will be in max
        
        const hue = 120 - (score / max) * 120;
        //const lightness = 60 - 25 * (score/max);
        return `hsl(${hue}, 100%, 55%)`
    } 
</script>


<!--Header and group selection-->
<section class="content page-groupOverview">
    <header class="content-head">
        <h1>Group Overview</h1>
        <div class="actions">
            <b style="font-size:20px">Group:</b>
            <select class="input">
                <option>Group 1</option>
                <option>Group 2</option>
            </select>
        </div>
    </header>
    <b style="font-size:20px">The first column represents the screening form scores for this group.</b>
</section>

<div class="grid-wrapper">

    <!-- Create the grid for the selected group -->
    <div class="grid" style="grid-template-columns: 100px repeat({totalCol.length}, 140px);">
        <!-- top-left empty cell -->
        <div class="header"></div>
        <!-- Form columns -->
        {#each totalCol as col}
            <div class="header">
                {col}
            </div>
        {/each}

        <!-- Data Rows -->
        {#each patients as p}
            <div class="patient">{p.name}</div>
            <!-- screening form scores-->
            {#each screeningForms as s }
                <div class="cell">
                    {#if p.scores?.screening[s] !== undefined}
                        <div class="pill" style="background-color: {colorFor(s, p.scores.screening[s])};flex: 1;display: flex;align-items: center;justify-content: center">{p.scores.screening[s]}</div>
                    {:else}
                        <span class="empty"> </span>
                    {/if}
                </div>
            {/each}
            <!-- Pre group forms -->
            {#each pregroupForms as pf}
                <div class="cell">
                    {#if p.scores?.pregroup[pf] !== undefined}
                        <div class="pill" style="background-color: {colorFor(pf, p.scores.pregroup[pf])};flex: 1;display: flex;align-items: center;justify-content: center;">{p.scores.pregroup[pf]}</div>
                    {:else}
                        <span class="empty"> </span>
                    {/if}
                </div>
            {/each}
            <!-- session forms -->
            {#each sessionDates as date}
                <div class="cell">
                <!-- check if there is any form data for that date-->
                {#if p.scores[date] != undefined}
                    <!-- now look at the specific forms -->
                    {#each sessionForms as sf}
                        <!-- if there is data for that form make it-->
                        {#if p.scores[date][sf] != undefined}
                            <div class="pill" style="background-color: {colorFor(sf, p.scores[date][sf])}">{p.scores[date][sf]}</div>
                        {:else}
                            <span class="empty"> </span>
                        {/if}
                    {/each}
                {:else}
                    <span class="empty"> </span>    
                {/if}
                </div>
            {/each}
            <!-- post group forms-->
            {#each postgroupForms as pf}
                <div class="cell">
                    {#if p.scores?.postgroup[pf] != undefined}
                        <div class="pill" style="background-color: {colorFor(pf, p.scores.postgroup[pf])};flex: 1;display: flex;align-items: center;justify-content: center;">{p.scores.postgroup[pf]}</div>
                    {:else}
                        <span class="empty"> </span>
                    {/if}
                </div>
            {/each}
        {/each}

        <!-- bottom-left empty cell -->
        <div class="header"></div>
        <!-- Bottom columns -->
        <div class="header" style="grid-column: span {screeningForms.length + pregroupForms.length}">Pre-group (On/Before {sessionDates[0]})</div>
        {#each sessionDates as d}
            <div class="header">{d}</div>
        {/each}
        <div class="header" style="grid-column: span {postgroupForms.length}">Post-group (After {sessionDates[sessionDates.length - 1]})</div>
    </div>
</div>




<style>
  .page-groupOverview .content-head{display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:center}
  .page-groupOverview .actions{display:flex;gap:8px;flex-wrap:wrap}
  .page-groupOverview h1,
  .page-groupOverview b{color:#0f172a}
  .grid-wrapper{max-width: 100vw; overflow-x: auto; overflow-y: hidden;}
  .grid {display: grid;gap: 6px;align-items: stretch;min-width: max-content;}
  .header {font-weight: 600;background: #f3f3f3;padding: 8px;text-align: center;color:#111827}
  .patient {font-weight: 500;padding: 8px;text-align: center;color:#111827}
  .cell {padding: 6px;background: #fafafa;display: flex;flex-direction: column;gap: 0px;color:#111827}
  .pill {padding: 4px 6px;font-size: 0.8rem;text-align: center;font-weight: bolder;font-size: 13px;}
  .empty {color: #999;}

  :global(:root[data-theme='dark']) .page-groupOverview h1,
  :global(:root[data-theme='dark']) .page-groupOverview b,
  :global(:root[data-theme='dark']) .header,
  :global(:root[data-theme='dark']) .patient,
  :global(:root[data-theme='dark']) .cell,
  :global(:root[data-theme='dark']) .empty {
    color: #e5e7eb;
  }

  :global(:root[data-theme='dark']) .header {
    background: #1f2937;
  }

  :global(:root[data-theme='dark']) .cell {
    background: #0f172a;
    border: 1px solid #334155;
  }

  :global(:root[data-theme='dark']) .empty {
    color: #94a3b8;
  }
</style>
