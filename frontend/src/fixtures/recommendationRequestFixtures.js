const recommendationRequestFixtures = {
  oneRecommendationRequest: {
    id: 1,
    requesterEmail: "abrahamlincoln@ucsb.edu",
    professorEmail: "georgewashington@ucsb.edu",
    explanation: "PhD for CS at UCLA",
    dateRequested: "2025-05-01T12:00:00",
    dateNeeded: "2025-09-01T12:00:00",
    done: "false",
  },
  threeRecommendationRequests: [
    {
      id: 1,
      requesterEmail: "johnadams@ucsb.edu",
      professorEmail: "jamesmonroe@ucsb.edu",
      explanation: "PhD for Physics at Berkeley",
      dateRequested: "2025-08-01T12:00:00",
      dateNeeded: "2025-09-01T12:00:00",
      done: "false",
    },
    {
      id: 2,
      requesterEmail: "johnfkennedy@ucsb.edu",
      professorEmail: "thomasjefferson@ucsb.edu",
      explanation: "PhD for Economics at MIT",
      dateRequested: "2025-05-03T9:15:15",
      dateNeeded: "2025-10-01T12:30:30",
      done: "true",
    },
    {
      id: 3,
      requesterEmail: "alanturing@ucsb.edu",
      professorEmail: "adalovelace@ucsb.edu",
      explanation: "MA for Mathematics at Cambridge",
      dateRequested: "2024-06-01T12:00:00",
      dateNeeded: "2024-12-07T12:00:00",
      done: "false",
    },
  ],
};

export { recommendationRequestFixtures };
