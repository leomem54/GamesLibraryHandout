/// <reference types="cypress" />

/**
 * Formularabbruch und Bild-Fallbacks schützen Nutzer vor ungewollten Änderungen
 * und vor kaputten Darstellungen durch fehlende oder unerreichbare Cover-URLs.
 */
describe('Formular und Darstellung', () => {
  const createdTitles: string[] = [];
  const uniqueTitle = (label: string) => `${label} ${Date.now()}-${Cypress._.random(1000, 9999)}`;

  beforeEach(() => {
    createdTitles.length = 0;
    cy.visitApp();
  });

  afterEach(() => {
    createdTitles.forEach((title) => cy.deleteGameByTitle(title));
  });

  it('verwirft Änderungen beim Abbrechen des Bearbeitungsformulars', () => {
    const title = uniqueTitle('Cypress Edit Cancel');
    const description = `Originalbeschreibung ${Date.now()}`;
    createdTitles.push(title);

    cy.request('POST', '/api/games', {
      title,
      description,
      imageUrl: '',
      releaseDate: '2020-04-15',
    });
    cy.reload();

    cy.contains('.game-card', title).within(() => {
      cy.get('.game-card__title').should('have.text', title);
      cy.get('.game-card__description').should('have.text', description);
      cy.get('.game-card__btn--edit').click();
    });

    cy.fillGameForm({
      title: `${title} verändert`,
      description: 'Diese Änderung darf nicht gespeichert werden.',
    });
    cy.get('.game-form__btn--cancel').click();

    cy.get('.game-form').should('not.exist');
    cy.contains('.game-card', title).within(() => {
      cy.get('.game-card__title').should('have.text', title);
      cy.get('.game-card__description').should('have.text', description);
    });
    cy.contains('.game-card__title', `${title} verändert`).should('not.exist');
  });

  it('ersetzt eine kaputte Bild-URL durch No Image und entfernt das img-Element', () => {
    const title = uniqueTitle('Cypress Broken Image');
    const brokenImageUrl = `https://invalid.example.test/broken-cover-${Date.now()}.jpg`;
    createdTitles.push(title);
    cy.intercept('GET', 'https://invalid.example.test/**', { forceNetworkError: true });

    cy.openAddGameForm();
    cy.fillGameForm({ title, imageUrl: brokenImageUrl, releaseDate: '2021-05-20' });
    cy.get('.game-form__btn--submit').click();

    cy.contains('.game-card', title).within(() => {
      cy.get('.game-card__no-image').should('contain.text', 'No Image');
      cy.get('img.game-card__image').should('not.exist');
    });
  });

  it('zeigt No Image, wenn beim Anlegen keine Bild-URL angegeben wird', () => {
    const title = uniqueTitle('Cypress Without Image');
    createdTitles.push(title);

    cy.openAddGameForm();
    cy.fillGameForm({ title, releaseDate: '2019-09-10' });
    cy.get('.game-form__btn--submit').click();

    cy.contains('.game-card', title).within(() => {
      cy.get('.game-card__no-image').should('contain.text', 'No Image');
      cy.get('img.game-card__image').should('not.exist');
    });
  });
});
