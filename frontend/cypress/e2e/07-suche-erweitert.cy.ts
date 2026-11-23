/// <reference types="cypress" />

/**
 * Erweiterte Sucheingaben sind testenswert, weil reale Nutzer Sonderzeichen
 * und sehr lange Texte eingeben können, ohne dass die Oberfläche ausfallen darf.
 */
describe('Erweiterte Suche', () => {
  beforeEach(() => {
    cy.visitApp();
  });

  it('verarbeitet Sonderzeichen und Umlaute ohne Absturz', () => {
    const searchTerm = '% < > & ÄÖÜ äöü';

    cy.intercept('GET', '/api/games/search*').as('specialSearch');
    cy.get('.search-bar__input').type(searchTerm);
    cy.get('.search-bar__button').click();
    cy.wait('@specialSearch').its('response.statusCode').should('eq', 200);

    cy.get('.home-page').should('be.visible');
    cy.get('body').then(($body) => {
      const hasGames = $body.find('.game-card').length > 0;
      const hasEmptyState = $body.find('.game-list__status-title').text().includes('No Games Found');
      expect(hasGames || hasEmptyState, 'Treffer oder leerer Ergebniszustand').to.eq(true);
    });
  });

  it('verarbeitet einen Suchbegriff mit mehr als 200 Zeichen ohne hängenden Request', () => {
    const longSearchTerm = `Cypress-${'SehrLangerSuchbegriff'.repeat(12)}`;

    cy.intercept('GET', '/api/games/search*').as('longSearch');
    cy.get('.search-bar__input').type(longSearchTerm, { delay: 0 });
    cy.get('.search-bar__button').click();
    cy.wait('@longSearch').its('response.statusCode').should('eq', 200);

    cy.get('.game-list__status-title').should('contain.text', 'No Games Found');
    cy.get('.home-page').should('be.visible');
  });

  it('sendet die Suche nicht bei jedem Tastendruck, sondern erst per Enter', () => {
    let searchRequests = 0;
    cy.intercept('GET', '/api/games/search*', (req) => {
      searchRequests += 1;
      req.continue();
    }).as('searchOnSubmit');

    // Aktuelles Verhalten: Tippen allein sucht nicht; Button oder Enter sendet das Formular ab.
    cy.get('.search-bar__input').type('Minecraft');
    cy.then(() => expect(searchRequests, 'Requests während der Eingabe').to.eq(0));

    cy.get('.search-bar__input').type('{enter}');
    cy.wait('@searchOnSubmit');
    cy.then(() => expect(searchRequests, 'Requests nach Enter').to.eq(1));
  });
});
