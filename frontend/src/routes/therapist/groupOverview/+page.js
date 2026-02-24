import { API_BASE, MAX } from "./constants";
import { browser } from "$app/environment";
/*
// get this therapists group data
if (browser) {
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
        const groupOverviewData = groupOverviewRes.json
        console.log(groupOverviewData)
        console.log("Done.") // for testing purposes

    } catch (err) {
        console.error(err);
    }
}*/
