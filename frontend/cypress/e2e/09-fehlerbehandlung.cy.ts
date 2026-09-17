/// <reference types="cypress" />

/**
 * Fehlerbehandlung ist testenswert, weil Backend- und Netzwerkfehler Nutzern
 * verständlich angezeigt werden müssen, ohne falsche Daten oder leere Seiten zu erzeugen.
 */
describe('Fehlerbehandlung', () => {
  it('zeigt beim initialen Ladefehler das Fehlerbanner der Startseite', () => {
    cy.intercept('GET', '/api/games', {
      statusCode: 500,
      body: { message: 'Testfehler beim Laden' },
    }).as('initialLoadError');

    cy.visit('/');
    cy.wait('@initialLoadError');

    cy.get('.home-page__error')
      .should('be.visible')
      .and('contain.text', 'Fehler beim Laden der Spiele.');
    cy.get('.home-page').should('be.visible');
  });

  it('zeigt bei einem Suchfehler eine sinnvolle Meldung statt eines kaputten Bildschirms', () => {
    cy.visitApp();
    cy.intercept('GET', '/api/games/search*', {
      statusCode: 500,
      body: { message: 'Testfehler bei der Suche' },
    }).as('searchError');

    cy.get('.search-bar__input').type(`Fehlersuche-${Date.now()}`);
    cy.get('.search-bar__button').click();
    cy.wait('@searchError');

    cy.get('.home-page__error')
      .should('be.visible')
      .and('contain.text', 'Fehler bei der Suche.');
    cy.get('.home-page').should('be.visible');
  });

  it('zeigt einen Netzwerkfehler beim Erstellen und ergänzt das Spiel nicht optimistisch', () => {
    const title = `Cypress Network Error ${Date.now()}-${Cypress._.random(1000, 9999)}`;
    cy.visitApp();
    cy.intercept('POST', '/api/games', { forceNetworkError: true }).as('createNetworkError');

    cy.openAddGameForm();
    cy.fillGameForm({ title, releaseDate: '2022-02-02' });
    cy.get('.game-form__btn--submit').click();
    cy.wait('@createNetworkError');

    // Aktuelles Verhalten: Das Formular schließt sich auch nach dem abgefangenen POST-Fehler.
    cy.get('.game-form').should('not.exist');
    cy.contains('.game-card__title', title).should('not.exist');
    cy.get('.home-page__error')
      .should('be.visible')
      .and('contain.text', 'Fehler beim Erstellen des Spiels.');
  });
});
