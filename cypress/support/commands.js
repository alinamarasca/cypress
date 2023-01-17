Cypress.Commands.add("getServerResponse", expectedResponse => {
  cy.get(".live-responses-table")
    .find(".response")
    .find(".response-col_status")
    .contains(expectedResponse);
});
