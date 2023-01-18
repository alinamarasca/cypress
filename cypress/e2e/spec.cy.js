describe("test CRUD", () => {
  describe("creates a new pet", () => {
    it("shows error if invalid JSON", () => {
      cy.visit("/addPet");
      cy.openInput();
      cy.get("textarea").clear().type(`{leftArrow} invalid json`);
      cy.contains("Execute").click();
      cy.checkErrorMessage("Parameter string value must be valid JSON");
    }),
      it("successfully creates a new pet if valid JSON", () => {
        cy.visit("/addPet");
        cy.openInput();
        cy.get("textarea")
          .clear()
          .type(
            `{leftArrow} "id": 101,
          "category": {
            "id": 0,
            "name": "string"
          },
          "name": "piggie",
          "photoUrls": [
            "string"
          ],
          "tags": [
            {
              "id": 0,
              "name": "string"
            }
          ],
          "status": "available"`
          );
        cy.contains("Execute").click();
        cy.getServerResponse(200);
      }),
      // questionable behavior. if it was real test case, I would check in with user-stories/developers/?
      // to learn which behavior is expected => write test accordingly: to check if it creates a pet or shows error
      // for now, I will assume it had to show error message => TEST WILL NOT PASS
      it("shows error if empty JSON", () => {
        cy.visit("/addPet");
        cy.openInput();
        cy.get("textarea").clear().type(`{leftArrow}`);
        cy.contains("Execute").click();
        cy.checkErrorMessage("Required data is not provided");
      });
  });

  describe("read a new pet", () => {
    it("successfully finds pet by id", () => {
      cy.visit("/getPetById");
      cy.openInput();
      cy.get("input[placeholder='petId']").type("101");
      cy.contains("Execute").click();
      cy.getServerResponse(200);
    });

    it("shows error if no id provided", () => {
      cy.visit("/getPetById");
      cy.openInput();
      cy.get("input[placeholder='petId']").invoke("val", "");
      cy.contains("Execute").click();
      cy.checkErrorMessage("Required field is not provided");
    });

    // again, I would check in with documentation, but will assume for now en error should have been shown => TEST WILL NOT PASS
    it("shows error if wrong/non existent id provided", () => {
      cy.visit("/getPetById");
      cy.openInput();
      cy.get("input[placeholder='petId']").type(0);
      cy.contains("Execute").click();
      cy.checkErrorMessage("This id does not exist, try another one");
    });
  });

  describe("updates a pet", () => {
    it("successfully updates a pet", () => {
      cy.visit("/updatePet");
      cy.openInput();
      cy.get("textarea")
        .clear()
        .type(
          `{leftArrow} "id": 101,
          "category": {
            "id": 0,
            "name": "string"
          },
          "name": "ignited-piggie",
          "photoUrls": [
            "string"
          ],
          "tags": [
            {
              "id": 0,
              "name": "string"
            }
          ],
          "status": "available"`
        );
      cy.contains("Execute").click();
      cy.getServerResponse(200);
    }),
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
      cy.get("input[placeholder='petId']").type("101");
      cy.contains("Execute").click();
      cy.getServerResponse(200);
    });

    it("returns 404 when removed pet is requested", () => {
      cy.visit("/getPetById");
      cy.openInput();
      cy.get("input[placeholder='petId']").type("101");
      cy.contains("Execute").click();
      cy.getServerResponse(404);
    });

    it("shows error if no id is provided", () => {
      cy.visit("/deletePet");
      cy.openInput();
      cy.get("input[placeholder='petId']").invoke("val", "");
      cy.contains("Execute").click();
      cy.checkErrorMessage("Required field is not provided");
    });

    // again, I would check in with documentation, but will assume for now en error should have been shown => TEST WILL NOT PASS
    it("shows error if empty JSON", () => {
      cy.visit("/deletePet");
      cy.openInput();
      cy.get("textarea").clear().type(`{leftArrow}`);
      cy.contains("Execute").click();
      cy.checkErrorMessage("This id does not exist, try another one");
    });
  });
});
