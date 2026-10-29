import React from "react";
import UCSBOrganizationTable from "main/components/UCSBOrganization/UCSBOrganizationTable";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "components/UCSBOrganization/UCSBOrganizationTable",
  component: UCSBOrganizationTable,
};

const Template = (args) => <UCSBOrganizationTable {...args} />;

export const Empty = Template.bind({});
Empty.args = {
  organizations: [],
  currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsOrdinaryUser = Template.bind({});
ThreeItemsOrdinaryUser.args = {
  organizations: ucsbOrganizationFixtures.threeOrganizations,
  currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsAdminUser = Template.bind({});
ThreeItemsAdminUser.args = {
  organizations: ucsbOrganizationFixtures.threeOrganizations,
  currentUser: currentUserFixtures.adminUser,
};
ThreeItemsAdminUser.parameters = {
  msw: [
    http.delete("/api/UCSBOrganization", ({ request }) => {
      const orgCode = new URL(request.url).searchParams.get("orgCode");
      return HttpResponse.json({
        message: `UCSBOrganization with id ${orgCode} deleted`,
      });
    }),
  ],
};

export const InactiveOrganization = Template.bind({});
InactiveOrganization.args = {
  organizations: [
    { ...ucsbOrganizationFixtures.oneOrganization[0], inactive: true },
  ],
  currentUser: currentUserFixtures.userOnly,
};
