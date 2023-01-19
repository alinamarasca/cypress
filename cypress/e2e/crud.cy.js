/// <reference types="cypress"/>

import newPet from "../fixtures/newPet.json";
import updatedPet from "../fixtures/newPet.json";

describe("user can create, find, update, delete a pet", () => {
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

  describe("user can find a pet by id", () => {
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

  describe("user can update a pet", () => {
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

  describe("deletes pet by id", () => {
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
  });
});
