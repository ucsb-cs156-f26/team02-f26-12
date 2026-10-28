import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/useCurrentUser";

function cellToAxiosParamsDelete(cell) {
  return {
    url: "/api/UCSBOrganization",
    method: "DELETE",
    params: {
      orgCode: cell.row.original.orgCode,
    },
  };
}

function onDeleteSuccess(message) {
  console.log(message);
  toast(message.message);
}

export default function UCSBOrganizationTable({
  organizations,
  currentUser,
  testIdPrefix = "UCSBOrganizationTable",
}) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/ucsborganization/edit/${cell.row.original.orgCode}`);
  };

  // Stryker disable all : hard to test for query caching

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/UCSBOrganization/all"],
  );
  // Stryker restore all

  // Stryker disable next-line all : TODO try to make a good test for this
  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

  const columns = [
    {
      header: "Organization Code",
      accessorKey: "orgCode",
    },
    {
      header: "Short Name",
      accessorKey: "orgTranslationShort",
    },
    {
      header: "Full Name",
      accessorKey: "orgTranslation",
    },
    {
      header: "Inactive",
      accessorKey: "inactive",
      cell: ({ getValue }) => (getValue() ? "Yes" : "No"),
    },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(ButtonColumn("Edit", "primary", editCallback, testIdPrefix));
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, testIdPrefix),
    );
  }

  return (
    <OurTable data={organizations} columns={columns} testid={testIdPrefix} />
  );
}
