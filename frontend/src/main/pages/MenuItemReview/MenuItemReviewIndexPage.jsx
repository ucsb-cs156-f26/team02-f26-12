import React from "react";
import { useBackend } from "main/utils/useBackend";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import MenuItemReviewTable from "main/components/MenuItemReview/MenuItemReviewTable";
import { useCurrentUser, hasRole } from "main/utils/useCurrentUser";
import { Button } from "react-bootstrap";

export default function MenuItemReviewIndexPage() {
  const currentUser = useCurrentUser();

  const {
    data: menuItemReviews,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/menuitemreview/all"],
    { method: "GET", url: "/api/menuitemreview/all" },
    // Stryker disable next-line all : don't test default value of empty list
    [],
  );

  const createButton = () => {
    if (hasRole(currentUser, "ROLE_ADMIN")) {
      return (
        <Button
          variant="primary"
          href="/menuitemreview/create"
          style={{ float: "right" }}
        >
          Create MenuItemReview
        </Button>
      );
    }
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        {createButton()}
        <h1>MenuItemReviews</h1>
        <MenuItemReviewTable
          menuItemReviews={menuItemReviews}
          currentUser={currentUser}
        />
      </div>
    </BasicLayout>
  );
}
