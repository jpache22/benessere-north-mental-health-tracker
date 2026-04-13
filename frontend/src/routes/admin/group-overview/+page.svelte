<script lang="ts">
    import { API_BASE, MAX_QUESTION_SCORE, MAX_TOTAL_SCORE, NUM_OF_QUESTIONS} from "./constants";
    import { onMount } from "svelte";

    let errorMsg: string | null = null; // should still be empty
    // group state 
    let groups: any[] = [];
    let selectedGroupId: number | null = null;
    let selectedGroup: any = null;
    // data from json
    let patients = [];

    let screeningForms = [];
    let pregroupForms = [];
    let sessionForms = [];
    let postgroupForms = [];

    let sessionDates = [];
    let totalCol = [];

    let selectedCell = null; // flag for displaying a selected cell

    onMount(async () => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            errorMsg = "Not authenticated.";
            return;
        }

        try {
            const FETCH_URL = `${API_BASE}/patientData/admin`;

            const response = await fetch(FETCH_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const groupOverviewData = await response.json();

            if (groupOverviewData.success == false) {
                errorMsg = "Unable to load group overview data.";
                return;
            } else {
                // get the data needed for the table
                groups = groupOverviewData.patientData.groups ?? []; // array of all the group json
                // will update to be dynamic with dropdown
                if (groups.length > 0) {
                    selectedGroupId = groups[0].group_id;
                } else {
                    errorMsg = "You have been assigned to no groups."
                    return; // no groups to fetch means no table to display
                }


            }

        } catch (err) {
            errorMsg = "Network error.";
            console.error(err);
        }
    });

    $: {
        errorMsg = null; // reset each time group is changed
        selectedGroup = groups.find(g => g.group_id === selectedGroupId) ?? null;
        patients = selectedGroup?.patients ?? [];

        if (patients.length == 0) {
            errorMsg = "No patients have been assigned to this group yet."
        } else {
            // get list of all the forms
            screeningForms = selectedGroup?.project_forms?.screening?? [];
            pregroupForms = selectedGroup?.project_forms?.pregroup ?? [];
            postgroupForms = selectedGroup?.project_forms?.postgroup ?? [];
            sessionForms = selectedGroup?.project_forms?.session ?? [];
            sessionDates = selectedGroup?.session_dates ?? [];

            // temp needed for the form name formatting of the top title row
            let joinedFormNames = sessionForms.join("/ ");
            let sessionFormNameCols = []
            sessionDates.forEach(d => { sessionFormNameCols.push(joinedFormNames)});
            // total columns (also top row of table)
            totalCol = [
                ...screeningForms,
                ...pregroupForms,
                ...sessionFormNameCols,
                ...postgroupForms
            ];
        }
    }

    // Determines the color of the cell based on score and max possible score (can be used for total score and individual question scores)
    function colorFor(score: number, max: number) {
        const hue = 120 - (score/max) * 120;
        return `hsl(${hue}, 100%, 55%)`;
    }

    // Given an array of form names returns the max number of questions a single form has
    function maxQuestions(formList: string[]) {
        let max = NUM_OF_QUESTIONS[formList[0]];
        for (let i = 1; i < formList.length; i++) {
            if (NUM_OF_QUESTIONS[formList[i]] > max) {
                max = NUM_OF_QUESTIONS[formList[i]];
            }
        }
        return max;
    }
</script>


<!--Header and group selection-->
<section class="content page-groupOverview">
    <header class="content-head">
        <h1>Group Overview</h1>
        <div class="actions">
            <b style="font-size:20px">Group:</b>
            <select class="input" bind:value={selectedGroupId}>
                {#each groups as g} 
                    <option value={g.group_id}>{g.grouplabel}</option>
                {/each}
            </select>
        </div>
    </header>
</section>

{#if errorMsg}
    <b style="font-size:20px; color:red">{errorMsg}</b>
{:else}
    {#if selectedGroup}
        <b style="font-size:20px">The first column represents the screening form scores for this group.</b>
        <div class="grid-wrapper">

            <!-- Create the grid for the selected group -->
            <div class="grid" style="grid-template-columns: 100px repeat({totalCol.length}, 60px);">
                <!-- top-left empty cell -->
                <div class="header"></div>
                <!-- Form columns -->
                {#each totalCol as col}
                    <div class="header">
                        <p>{col}</p>
                    </div>
                {/each}

                <!-- Data Rows -->
                {#each patients as p}
                    <div class="patient">{p.username}</div>
                    <!-- screening form scores-->
                    {#each screeningForms as s }
                    <!-- TODO: Add accessibility keys -->
                        <div class="cell {selectedCell?.patient === p && selectedCell?.projectPhase == "screening" && selectedCell?.formNames[0] === s ? 'active' : ''}" 
                            on:click={() => selectedCell = {
                                patient: p,
                                formNames: [s],
                                projectPhase: "screening"
                            }}>
                            {#if p.scores?.screening?.[s]}
                                <div class="pill" style="background-color: {colorFor(p.scores.screening[s].total_score, MAX_TOTAL_SCORE[s])};flex: 1;display: flex;align-items: center;justify-content: center">{p.scores.screening[s].total_score}</div>
                            {:else}
                                <div class="pill" style="color: #999;flex: 1;display: flex;align-items: center;justify-content: center"><span>   </span></div>
                            {/if}
                        </div>
                    {/each}
                    <!-- Pre group forms -->
                    {#each pregroupForms as pf}
                        <div class="cell {selectedCell?.patient === p && selectedCell?.projectPhase == "pregroup" && selectedCell?.formNames[0] == pf ? 'active' : ''}" 
                            on:click={() => selectedCell = {
                                patient: p,
                                formNames: [pf],
                                projectPhase: "pregroup"
                            }}>
                            {#if p.scores?.pregroup?.[pf]}
                                <div class="pill" style="background-color: {colorFor(p.scores.pregroup[pf].total_score, MAX_TOTAL_SCORE[pf])};flex: 1;display: flex;align-items: center;justify-content: center;">{p.scores.pregroup[pf].total_score}</div>
                            {:else}
                                <div class="pill" style="color: #999;flex: 1;display: flex;align-items: center;justify-content: center"><span>   </span></div>
                            {/if}
                        </div>
                    {/each}
                    <!-- session forms -->
                    {#each sessionDates as date}
                        <div class="cell {selectedCell?.patient === p && selectedCell?.projectPhase == "session" && selectedCell?.sessionDate == date && selectedCell?.formNames === sessionForms ? 'active' : ''}" 
                            on:click={() => selectedCell = {
                                patient: p,
                                formNames: sessionForms,
                                projectPhase: "session",
                                sessionDate: date
                            }}>
                        <!-- check if there is any form data for that date-->
                        {#if p.scores?.session?.[date]}
                            <!-- now look at the specific forms -->
                            {#each sessionForms as sf}
                                <!-- if there is data for that form make it-->
                                {#if p.scores?.session?.[date]?.[sf]}
                                    <div class="pill" style="background-color: {colorFor(p.scores.session[date][sf].total_score, MAX_TOTAL_SCORE[sf])}">{p.scores.session[date][sf].total_score}</div>
                                {:else}
                                    <div class="pill" style="color: #999;flex: 1;display: flex;align-items: center;justify-content: center"><span>   </span></div>
                                {/if}
                            {/each}
                        {:else}
                            <div class="pill" style="color: #999;flex: 1;display: flex;align-items: center;justify-content: center"><span>   </span></div>    
                        {/if}
                        </div>
                    {/each}
                    <!-- post group forms-->
                    {#each postgroupForms as pf}
                        <div class="cell {selectedCell?.patient === p && selectedCell?.projectPhase == "postgroup" && selectedCell?.formNames[0] === pf ? 'active' : ''}" 
                            on:click={() => selectedCell = {
                                patient: p,
                                formNames: [pf],
                                projectPhase: "postgroup"
                            }}>
                            {#if p.scores?.postgroup?.[pf]}
                                <div class="pill" style="background-color: {colorFor(p.scores.postgroup?.[pf]?.total_score, MAX_TOTAL_SCORE[pf])};flex: 1;display: flex;align-items: center;justify-content: center;">{p.scores.postgroup?.[pf]?.total_score}</div>
                            {:else}
                                <div class="pill" style="color: #999;flex: 1;display: flex;align-items: center;justify-content: center"><span>   </span></div>
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
    {:else}
        <b style="font-size: 20px">Loading...</b>
    {/if}
    <!-- may not be reactive check -->
    {#if selectedCell}
        {#key selectedCell.patient["patient_id"] + selectedCell.projectPhase + selectedCell.formName}
            <!-- make table for selected patient and session -->
            <b style="font-size:20px">Score Deep Dive for {selectedCell.patient["username"]}:</b>
            <div class="grid-wrapper">
                <div class="grid" style="grid-template-columns: 50px repeat({maxQuestions(selectedCell.formNames)}, 100px);">
                    <!-- top-left empty cell -->
                    <div class="header"></div>
                    <!-- header labels -->
                    {#each {length: maxQuestions(selectedCell.formNames) }, n}
                        <div class="header">{n + 1}</div>
                    {/each}

                    <!-- make each row -->
                    {#each selectedCell.formNames as form}
                        <!-- form name -->
                        <div class="patient">{form}</div>
                        <!-- individual question scores -->
                        {#each {length: maxQuestions(selectedCell.formNames)}, i}
                            <!-- may need to change -->
                            {#if selectedCell.patient?.scores?.[selectedCell.projectPhase]?.[form]}
                                <div class="pill" style="background-color: {colorFor(selectedCell.patient.scores[selectedCell.projectPhase][form].responses["q" + (i + 1).toString()], MAX_QUESTION_SCORE[form])};flex: 1;display: flex;align-items: center;justify-content: center">
                                        {selectedCell.patient.scores[selectedCell.projectPhase][form].responses["q" + (i + 1).toString()]}
                                </div>
                            {:else if selectedCell.patient?.scores?.session?.[selectedCell.sessionDate]?.[form] && i < NUM_OF_QUESTIONS[form]}
                                <div class="pill" style="background-color: {colorFor(selectedCell.patient.scores.session[selectedCell.sessionDate][form].responses.q1, MAX_QUESTION_SCORE[form])};flex: 1;display: flex;align-items: center;justify-content: center">
                                        {selectedCell.patient.scores.session[selectedCell.sessionDate][form].responses["q" + (i+1).toString()]}
                                </div>
                            {:else}
                                <div class="pill" style="color: #999;flex: 1;display: flex;align-items: center;justify-content: center">
                                    N/A
                                </div>
                            {/if}
                        {/each}    
                    {/each}     
                </div>
            </div>
        {/key}
    {/if}
{/if}




<style>
  .page-groupOverview .content-head{display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:center}
  .page-groupOverview .actions{display:flex;gap:8px;flex-wrap:wrap}
  .page-groupOverview h1,
  .page-groupOverview b{color:#0f172a}
  .grid-wrapper{max-width: 100vw; overflow-x: auto; overflow-y: hidden;}
  .grid {display: grid;gap: 6px;align-items: stretch;min-width: max-content;}
  .header {font-weight: 600;background: #f3f3f3;padding: 8px;text-align: center;color:#111827}
  .patient {font-weight: 500;padding: 8px;text-align: center;color:#111827}
  .cell {padding: 6px;background: #fafafa;display: flex;flex-direction: column;gap: 0px;color:#111827;cursor:pointer}
  .cell.active {outline: 3px solid #333;}
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
