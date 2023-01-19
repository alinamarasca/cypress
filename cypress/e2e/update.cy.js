/// <reference types="cypress"/>

import updatedPet from "../fixtures/newPet.json";

describe("updates a pet", () => {
  beforeEach(() => {
    cy.visit("/updatePet");
    cy.openInput();
  });

  it("successfully updates a pet", () => {
    cy.get("textarea").type("{selectall}");
    cy.get("textarea").type(`${JSON.stringify(updatedPet.data)}`, {
      parseSpecialCharSequences: false
    });

    cy.intercept({
      method: "PUT",
      url: "https://petstore.swagger.io/v2/pet"
    }).as("upd-pet");

    cy.submitData();
    cy.getServerResponse(200);

    cy.wait("@upd-pet").then(({ response, request, state }) => {
      expect(response.statusCode).to.eq(200);
      expect(response.statusMessage).to.eq("OK");
      expect(state).to.eq("Complete");
      expect(response.body).to.deep.eq(request.body);
    });
  });

  it("shows error if invalid JSON", () => {
    cy.get("textarea").clear().type(`{leftArrow} invalid json`);
    cy.submitData();
    cy.checkErrorMessage("Parameter string value must be valid JSON");
  });

  // again, I would check in with documentation, but will assume for now en error should have been shown => TEST WILL NOT PASS
  it("shows error if empty JSON", () => {
    cy.get("textarea").clear().type(`{leftArrow}`);
    cy.submitData();
    cy.checkErrorMessage("Required data is not provided");
  });
});
