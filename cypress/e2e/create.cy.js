/// <reference types="cypress"/>

import newPet from "../fixtures/newPet.json";

describe("user can create a new pet", () => {
  beforeEach(() => {
    cy.visit("/addPet");
    cy.openInput();

    cy.intercept({
      method: "POST",
      url: "https://petstore.swagger.io/v2/pet"
    }).as("new-pet");
  });

  it("shows error if invalid JSON", () => {
    cy.get("textarea").clear().type(`{leftArrow} invalid json`);
    cy.submitData();
    cy.checkErrorMessage("Parameter string value must be valid JSON");

    cy.countApiCalls("new-pet", 0);
  });

  it("shows server's response if successfully created a pet", () => {
    cy.get("textarea").type("{selectall}");
    cy.get("textarea").type(`${JSON.stringify(newPet.data)}`, {
      parseSpecialCharSequences: false
    });
    cy.submitData();
    cy.getServerResponse(200);

    cy.wait("@new-pet").then(({ response, request, state }) => {
      expect(request.method).to.equal("POST");
      expect(response.statusCode).to.eq(200);
      expect(response.statusMessage).to.eq("OK");
      expect(state).to.eq("Complete");
      expect(response.body).to.deep.eq(request.body);
    });

    cy.countApiCalls("new-pet", 1);
  });

  // questionable behavior. if it was real test case, I would check in with user-stories/developers/?
  // to learn which behavior is expected => write test accordingly: to check if it creates a pet or shows error
  // for now, I will assume it had to show error message => TEST WILL NOT PASS
  it("shows error if empty JSON", () => {
    cy.get("textarea").clear().type(`{leftArrow}`);
    cy.submitData();

    cy.wait("@new-pet").then(({ response, request, state }) => {
      expect(request.method).to.equal("POST");
      expect(response.statusCode).to.eq(200);
      expect(response.statusMessage).to.eq("OK");
      expect(state).to.eq("Complete");
      expect(response.body.id).to.not.eq("0");
    });

    cy.checkErrorMessage("Required data is not provided");
  });
});
