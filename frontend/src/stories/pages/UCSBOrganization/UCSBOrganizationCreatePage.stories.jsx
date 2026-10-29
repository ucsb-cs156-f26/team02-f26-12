import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";
import UCSBOrganizationCreatePage from "main/pages/UCSBOrganization/UCSBOrganizationCreatePage";

export default {
  title: "pages/UCSBOrganization/UCSBOrganizationCreatePage",
  component: UCSBOrganizationCreatePage,
};

const Template = () => <UCSBOrganizationCreatePage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.adminUser, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.post("/api/UCSBOrganization/post", ({ request }) => {
      const params = new URL(request.url).searchParams;
      return HttpResponse.json(
        {
          orgCode: params.get("orgCode"),
          orgTranslationShort: params.get("orgTranslationShort"),
          orgTranslation: params.get("orgTranslation"),
          inactive: params.get("inactive") === "true",
        },
        { status: 200 },
      );
    }),
  ],
};
