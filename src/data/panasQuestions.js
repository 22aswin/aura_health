export const scoreOptions = [
    { score: 1, label: 'Very slightly or not at all', emoji: '🌑' },
    { score: 2, label: 'A little', emoji: '🌒' },
    { score: 3, label: 'Moderately', emoji: '🌓' },
    { score: 4, label: 'Quite a bit', emoji: '🌔' },
    { score: 5, label: 'Extremely', emoji: '🌕' }
];

export const panasQuestions = [
    // Positive Affect (10 items)
    { id: 1, type: 'positive', emotion: 'Interested', question: 'To what extent do you feel interested right now?', options: scoreOptions },
    { id: 2, type: 'positive', emotion: 'Excited', question: 'To what extent do you feel excited right now?', options: scoreOptions },
    { id: 3, type: 'positive', emotion: 'Strong', question: 'To what extent do you feel strong right now?', options: scoreOptions },
    { id: 4, type: 'positive', emotion: 'Enthusiastic', question: 'To what extent do you feel enthusiastic right now?', options: scoreOptions },
    { id: 5, type: 'positive', emotion: 'Proud', question: 'To what extent do you feel proud right now?', options: scoreOptions },
    { id: 6, type: 'positive', emotion: 'Alert', question: 'To what extent do you feel alert right now?', options: scoreOptions },
    { id: 7, type: 'positive', emotion: 'Inspired', question: 'To what extent do you feel inspired right now?', options: scoreOptions },
    { id: 8, type: 'positive', emotion: 'Determined', question: 'To what extent do you feel determined right now?', options: scoreOptions },
    { id: 9, type: 'positive', emotion: 'Attentive', question: 'To what extent do you feel attentive right now?', options: scoreOptions },
    { id: 10, type: 'positive', emotion: 'Active', question: 'To what extent do you feel active right now?', options: scoreOptions },

    // Negative Affect (10 items)
    { id: 11, type: 'negative', emotion: 'Distressed', question: 'To what extent do you feel distressed right now?', options: scoreOptions },
    { id: 12, type: 'negative', emotion: 'Upset', question: 'To what extent do you feel upset right now?', options: scoreOptions },
    { id: 13, type: 'negative', emotion: 'Guilty', question: 'To what extent do you feel guilty right now?', options: scoreOptions },
    { id: 14, type: 'negative', emotion: 'Scared', question: 'To what extent do you feel scared right now?', options: scoreOptions },
    { id: 15, type: 'negative', emotion: 'Hostile', question: 'To what extent do you feel hostile right now?', options: scoreOptions },
    { id: 16, type: 'negative', emotion: 'Irritable', question: 'To what extent do you feel irritable right now?', options: scoreOptions },
    { id: 17, type: 'negative', emotion: 'Ashamed', question: 'To what extent do you feel ashamed right now?', options: scoreOptions },
    { id: 18, type: 'negative', emotion: 'Nervous', question: 'To what extent do you feel nervous right now?', options: scoreOptions },
    { id: 19, type: 'negative', emotion: 'Jittery', question: 'To what extent do you feel jittery right now?', options: scoreOptions },
    { id: 20, type: 'negative', emotion: 'Afraid', question: 'To what extent do you feel afraid right now?', options: scoreOptions }
];
