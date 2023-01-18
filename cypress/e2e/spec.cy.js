/// <reference types="cypress"/>

import newPet from "../fixtures/newPet.json";
import updatedPet from "../fixtures/newPet.json";

describe("test CRUD", () => {
  describe("creates a new pet", () => {
    it("shows error if invalid JSON", () => {
      cy.visit("/addPet");
      cy.openInput();
      cy.get("textarea").clear().type(`{leftArrow} invalid json`);
      // CHECK THAT API CALL WAS NOT MADE. how?
      cy.contains("Execute").click();
      cy.checkErrorMessage("Parameter string value must be valid JSON");
    });

    it("successfully creates a new pet if valid JSON", () => {
      cy.visit("/addPet");
      cy.openInput();
      cy.get("textarea").type("{selectall}");
      cy.get("textarea").type(`${JSON.stringify(newPet.data)}`, {
        parseSpecialCharSequences: false
      });

      cy.intercept({
        method: "POST",
        url: "https://petstore.swagger.io/v2/pet"
      }).as("new-pet");

      cy.contains("Execute").click();
      cy.getServerResponse(200);

      cy.wait("@new-pet").then(({ response, request, state }) => {
        expect(request.method).to.equal("POST");
        expect(response.statusCode).to.eq(200);
        expect(response.statusMessage).to.eq("OK");
        expect(state).to.eq("Complete");
        expect(response.body).to.deep.eq(request.body);
      });
    });

    // questionable behavior. if it was real test case, I would check in with user-stories/developers/?
    // to learn which behavior is expected => write test accordingly: to check if it creates a pet or shows error
    // for now, I will assume it had to show error message => TEST WILL NOT PASS
    it("shows error if empty JSON", () => {
      cy.visit("/addPet");
      // however API call happens, so I will check it, otherwise I would check that it did NOT happen
      cy.intercept({
        method: "POST",
        url: "https://petstore.swagger.io/v2/pet"
      }).as("new-pet");

      cy.openInput();
      cy.get("textarea").clear().type(`{leftArrow}`);
      cy.contains("Execute").click();

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

  describe("read a new pet", () => {
    it("successfully finds pet by id", () => {
      cy.visit("/getPetById");
      cy.openInput();
      cy.get("input[placeholder='petId']").type(newPet.data.id);

      cy.intercept({
        method: "GET",
        url: `https://petstore.swagger.io/v2/pet/${newPet.data.id}`
      }).as("pet-id");

      cy.contains("Execute").click();
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
      cy.visit("/getPetById");
      cy.openInput();
      cy.get("input[placeholder='petId']").invoke("val", "");

      cy.contains("Execute").click();
      cy.checkErrorMessage("Required field is not provided");
      //check that api call is not made
    });

    // again, I would check in with documentation, but will assume for now en error should have been shown => TEST WILL NOT PASS
    it("shows error if wrong/non existent id provided", () => {
      cy.visit("/getPetById");
      cy.openInput();
      cy.get("input[placeholder='petId']").type(0);

      cy.intercept({
        method: "GET",
        url: "https://petstore.swagger.io/v2/pet/0"
      }).as("pet-id");

      cy.contains("Execute").click();

      cy.wait("@pet-id").then(({ response, request }) => {
        expect(request.method).to.equal("GET");
        expect(response.statusCode).to.eq(404);
        expect(response.statusMessage).to.eq("Not Found");
      });

      cy.checkErrorMessage("This id does not exist, try another one");
    });
  });

  describe("updates a pet", () => {
    it("successfully updates a pet", () => {
      cy.visit("/updatePet");
      cy.openInput();
      cy.get("textarea").type("{selectall}");
      cy.get("textarea").type(`${JSON.stringify(updatedPet.data)}`, {
        parseSpecialCharSequences: false
      });

      cy.intercept({
        method: "PUT",
        url: "https://petstore.swagger.io/v2/pet"
      }).as("upd-pet");

      cy.contains("Execute").click();
      cy.getServerResponse(200);

      cy.wait("@upd-pet").then(({ response, request, state }) => {
        expect(response.statusCode).to.eq(200);
        expect(response.statusMessage).to.eq("OK");
        expect(state).to.eq("Complete");
        expect(response.body).to.deep.eq(request.body);
      });
    });

    it("shows error if invalid JSON", () => {
      cy.visit("/updatePet");
      cy.openInput();
      cy.get("textarea").clear().type(`{leftArrow} invalid json`);
      cy.contains("Execute").click();
      cy.checkErrorMessage("Parameter string value must be valid JSON");
    });

    // again, I would check in with documentation, but will assume for now en error should have been shown => TEST WILL NOT PASS
    it("shows error if empty JSON", () => {
      cy.visit("/updatePet");
      cy.openInput();
      cy.get("textarea").clear().type(`{leftArrow}`);
      cy.contains("Execute").click();
      cy.checkErrorMessage("Required data is not provided");
    });
  });

  describe("deletes pet by id", () => {
    it("successfully deletes pet by id", () => {
      cy.visit("/deletePet");
      cy.openInput();
      cy.get("input[placeholder='petId']").type(newPet.data.id);

      cy.intercept({
        method: "DELETE",
        url: `https://petstore.swagger.io/v2/pet/${newPet.data.id}`
      }).as("pet-id");
      cy.contains("Execute").click();
      cy.getServerResponse(200);

      cy.wait("@pet-id").then(({ response, request }) => {
        expect(request.method).to.equal("DELETE");
        expect(response.statusCode).to.eq(200);
        expect(response.statusMessage).to.eq("OK");
        expect(response.body.message).to.eq(`${newPet.data.id}`);
      });
    });

    it("returns 404 when removed pet is requested", () => {
      cy.visit("/getPetById");
      cy.openInput();
      cy.get("input[placeholder='petId']").type(newPet.data.id);

      cy.intercept({
        method: "GET",
        url: `https://petstore.swagger.io/v2/pet/${newPet.data.id}`
      }).as("pet-id");

      cy.contains("Execute").click();

      cy.wait("@pet-id").then(({ response, request }) => {
        expect(request.method).to.equal("GET");
        expect(response.statusCode).to.eq(404);
        expect(response.statusMessage).to.eq("Not Found");
      });

      cy.getServerResponse(404);
    });

    it("shows error if no id is provided", () => {
      cy.visit("/deletePet");
      cy.openInput();
      cy.get("input[placeholder='petId']").invoke("val", "");
      cy.contains("Execute").click();
      cy.checkErrorMessage("Required field is not provided");
    });
  });
});
