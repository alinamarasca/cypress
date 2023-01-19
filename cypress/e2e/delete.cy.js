/// <reference types="cypress"/>
import newPet from "../fixtures/newPet.json";

describe("deletes pet by id", () => {
  it("creates a pet we will delete", () => {
    cy.visit("/addPet");
    cy.openInput();
    cy.get("textarea").type("{selectall}");
    cy.get("textarea").type(`${JSON.stringify(newPet.data)}`, {
      parseSpecialCharSequences: false
    });
    cy.submitData();
    cy.getServerResponse(200);
  });

  it("successfully deletes pet by id", () => {
    cy.visit("/deletePet");
    cy.openInput();
    cy.intercept({
      method: "DELETE",
      url: `https://petstore.swagger.io/v2/pet/${newPet.data.id}`
    }).as("pet-id");

    cy.get("input[placeholder='petId']").type(newPet.data.id);
    cy.submitData();
    cy.getServerResponse(200);

    cy.wait("@pet-id").then(({ response, request }) => {
      expect(request.method).to.equal("DELETE");
      expect(response.statusCode).to.eq(200);
      expect(response.statusMessage).to.eq("OK");
    });
  });

  it("checks that pet with given id is not returned", () => {
    cy.visit("/getPetById");
    cy.openInput();

    cy.intercept({
      method: "GET",
      url: `https://petstore.swagger.io/v2/pet/${newPet.data.id}`
    }).as("pet-id");

    cy.get("input[placeholder='petId']").type(newPet.data.id);
    cy.submitData();
    cy.wait("@pet-id").then(({ response, request }) => {
      expect(request.method).to.equal("GET");
      expect(response.statusCode).to.eq(404);
      expect(response.statusMessage).to.eq("Not Found");
    });
    cy.getServerResponse(404);
  });
});

describe("if wrong id is provided", () => {
  it("shows error if no id", () => {
    cy.visit("/deletePet");
    cy.openInput();
    cy.get("input[placeholder='petId']").invoke("val", "");

    cy.intercept({
      method: "DELETE",
      url: `https://petstore.swagger.io/v2/pet/`
    }).as("pet-id");

    cy.submitData();
    cy.checkErrorMessage("Required field is not provided");

    cy.countApiCalls("pet-id", 0);
  });

  it("shows error if id is not an integer", () => {
    cy.visit("/deletePet");
    cy.openInput();
    cy.get("input[placeholder='petId']").type("_char23-");

    cy.intercept({
      method: "DELETE",
      url: `https://petstore.swagger.io/v2/pet/`
    }).as("pet-id");

    cy.submitData();
    cy.checkErrorMessage("Value must be an integer");

    cy.countApiCalls("pet-id", 0);
  });
});
