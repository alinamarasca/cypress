describe("test CRUD", () => {
  describe("creates a new pet", () =>
    it("successfully creates a new pet", () => {
      cy.visit("/addPet");
      cy.contains("Try it out").click();
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
    }));

  describe("reads a new pet", () => {
    it("successfully finds pet by id", () => {
      cy.visit("/getPetById");
      cy.contains("Try it out").click();
      cy.get("input[placeholder='petId']").type("101");
      cy.contains("Execute").click();
      cy.getServerResponse(200);
    });
  });

  describe("updates a new pet", () => {
    it("successfully updates a pet", () => {
      cy.visit("/updatePet");
      cy.contains("Try it out").click();
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
    });
  });

  describe("deletes pet by id", () => {
    it("successfully deletes pet by id", () => {
      cy.visit("/deletePet");
      cy.contains("Try it out").click();
      cy.get("input[placeholder='petId']").type("101");
      cy.contains("Execute").click();
      cy.getServerResponse(200);
    });

    it("returns 404 when removed pet is requested", () => {
      cy.visit("/getPetById");
      cy.contains("Try it out").click();
      cy.get("input[placeholder='petId']").type("101");
      cy.contains("Execute").click();
      cy.getServerResponse(404);
    });
  });
});
