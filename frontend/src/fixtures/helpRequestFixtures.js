const helpRequestFixtures = {
  oneHelpRequest: [
    {
      id: 1,
      requesterEmail: "cgaucho@ucsb.edu",
      teamId: "f26-12",
      tableOrBreakoutRoom: "1",
      requestTime: "2026-10-28T10:00:00",
      explanation: "Need help with the backend API.",
      solved: false,
    },
  ],

  threeHelpRequests: [
    {
      id: 1,
      requesterEmail: "cgaucho@ucsb.edu",
      teamId: "f26-12",
      tableOrBreakoutRoom: "1",
      requestTime: "2026-10-28T10:00:00",
      explanation: "Need help with the backend API.",
      solved: false,
    },
    {
      id: 2,
      requesterEmail: "student@ucsb.edu",
      teamId: "f26-12",
      tableOrBreakoutRoom: "2",
      requestTime: "2026-10-28T11:30:00",
      explanation: "Need help debugging a test.",
      solved: true,
    },
    {
      id: 3,
      requesterEmail: "gaucho@ucsb.edu",
      teamId: "f26-12",
      tableOrBreakoutRoom: "3",
      requestTime: "2026-10-28T13:00:00",
      explanation: "Need help with the deployment.",
      solved: false,
    },
  ],
};

export { helpRequestFixtures };
