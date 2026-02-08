export const patients = [
    {
        "name": "Patient 1",
        "scores": {
            "screening": {"EPDS": 30},
            "pregroup": {"PHQ9": 21, "EPDS": 26},
            "February 7": {"PHQ9": 17, "EPDS": 20},
            "February 14": {"EPDS": 21, "PHQ9": 16},
            "February 21": {"EPDS": 17, "PHQ9": 20},
            "February 28": {"EPDS": 9, "PHQ9": 4},
            "postgroup": {"PHQ9": 15, "EPDS": 20}
        }
    },
    {
        "name": "Patient 2",
        "scores": {
            "screening": {"EPDS": 18},
            "pregroup": {"PHQ9": 27, "EPDS": 21},
            "February 7": {"PHQ9": 17, "EPDS": 16},
            "February 14": {"EPDS": 21, "PHQ9": 19},
            "February 21": {"EPDS": 11, "PHQ9": 5},
            "February 28": {"EPDS": 14, "PHQ9": 12},
            "postgroup": {"PHQ9": 12, "EPDS": 18}
        }
    },
    {
        "name": "Patient 3",
        "scores": {
            "screening": {"EPDS": 18},
            "pregroup": {"PHQ9": 11, "EPDS": 14},
            "February 7": {"PHQ9": 4, "EPDS": 14},
            "February 14": {"EPDS": 18, "PHQ9": 6},
            "February 28": {"EPDS": 9, "PHQ9": 5},
            "postgroup": {"PHQ9": 9, "EPDS": 20}
        }
    },
    {
        "name": "Patient 4",
        "scores": {
            "screening": {"EPDS": 16},
            "pregroup": {"PHQ9": 13, "EPDS": 14},
            "February 7": {"PHQ9": 15},
            "February 14": {"EPDS": 24, "PHQ9": 20},
            "February 21": {"EPDS": 15, "PHQ9": 12},
            "February 28": {"EPDS": 7, "PHQ9": 2},
            "postgroup": {"PHQ9": 19, "EPDS": 14}
        }
    },
    {
        "name": "Patient 5",
        "scores": {
            "screening": {"EPDS": 19},
            "pregroup": {"PHQ9": 20, "EPDS": 18},
            "February 7": {"PHQ9": 17, "EPDS": 20},
            "February 14": {"EPDS": 19, "PHQ9": 20},
            "February 28": {"EPDS": 15, "PHQ9": 11},
            "postgroup": {"PHQ9": 13, "EPDS": 16}
        }
    },
    {
        "name": "Patient 6",
        "scores": {
            "screening": {"EPDS": 20},
            "pregroup": {"PHQ9": 9, "EPDS": 20},
            "February 7": {"PHQ9": 9, "EPDS": 14},
            "February 21": {"EPDS": 12, "PHQ9": 12},
            "postgroup": {"PHQ9": 4, "EPDS": 9}
        }
    },
    {
        "name": "Patient 7",
        "scores": {
            "screening": {"EPDS": 19},
            "pregroup": {"PHQ9": 20, "EPDS": 23},
            "February 7": {"PHQ9": 10, "EPDS": 24},
            "February 14": {"EPDS": 21, "PHQ9": 23},
            "February 21": {"EPDS": 12, "PHQ9": 13},
            "February 28": {"EPDS": 13, "PHQ9": 13},
            "postgroup": {"PHQ9": 11, "EPDS": 15}
        }
    }
]

// will need project form data (i.e. what forms), already in the database in the project table
export const screeningForms = ["EPDS"]
export const pregroupForms = ["EPDS", "PHQ9"] 
export const sessionForms = ["EPDS", "PHQ9"]
export const postgroupForms = ["EPDS", "PHQ9"]

// session dates are in the group table in the database
export const sessionDates = ["February 7", "February 14", "February 21", "February 28"]