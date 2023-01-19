/// <reference types="cypress"/>

import newPet from "../fixtures/newPet.json";

describe("finds pet by id", () => {
  beforeEach(() => {
    cy.visit("/getPetById");
    cy.openInput();
  });

  it("finds pet by id", () => {
    cy.intercept({
      method: "GET",
      url: `https://petstore.swagger.io/v2/pet/${newPet.data.id}`
    }).as("pet-id");

    cy.get("input[placeholder='petId']").type(newPet.data.id);
    cy.submitData();
    cy.getServerResponse(200);

    cy.wait("@pet-id").then(({ response, request, state }) => {
      expect(request.method).to.equal("GET");
      expect(response.statusCode).to.eq(200);
      expect(response.statusMessage).to.eq("OK");
      expect(state).to.eq("Complete");
      expect(response.body.id).to.eq(newPet.data.id);
    });
  });

  it("shows error if no id provided", () => {
    cy.intercept({
      method: "GET",
      url: "https://petstore.swagger.io/v2/pet/"
    }).as("pet-id");

    cy.get("input[placeholder='petId']").invoke("val", "");
    cy.contains("Execute").click();
    cy.checkErrorMessage("Required field is not provided");

    cy.countApiCalls("pet-id", 0);
  });

  // again, I would check in with documentation, but will assume for now en error should have been shown => TEST WILL NOT PASS
  it("shows error if wrong/non existent id provided", () => {
    cy.intercept({
      method: "GET",
      url: "https://petstore.swagger.io/v2/pet/0"
    }).as("pet-id");

    cy.get("input[placeholder='petId']").type(0);
    cy.submitData();

    cy.wait("@pet-id").then(({ response, request }) => {
      expect(request.method).to.equal("GET");
      expect(response.statusCode).to.eq(404);
      expect(response.statusMessage).to.eq("Not Found");
    });

    cy.checkErrorMessage("This id does not exist, try another one");
  });
});
