Cypress.Commands.add("getServerResponse", expectedResponse => {
  cy.get(".response-col_status").contains(expectedResponse);
  cy.get(".responses-inner").find(".curl-command");
  cy.get(".responses-inner").find(".microlight");
  cy.get(".responses-inner").find(".live-responses-table");
  cy.get(".response-col_description").find(".highlight-code");
  cy.get(".response-col_description").find(".microlight");
});

Cypress.Commands.add("openInput", () => {
  cy.contains("Try it out").click();
});

Cypress.Commands.add("submitData", () => {
  cy.contains("Execute").click();
});

Cypress.Commands.add("checkErrorMessage", errorMessage => {
  cy.get(".validation-errors").find("ul").find("li").contains(errorMessage);
});

Cypress.Commands.add("countApiCalls", (alias, expectedAmount) => {
  cy.wait(2000);
  cy.get(`@${alias}.all`).then(interceptions => {
    expect(interceptions).to.have.length(expectedAmount);
  });
});
