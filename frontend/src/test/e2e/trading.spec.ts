describe('Trading Interface', () => {
    before(() => {
      cy.loginInstitutionalUser();
      cy.mockMarketData();
    });
  
    it('Executes algorithmic order', () => {
      cy.visit('/trading');
      cy.selectInstrument('BTC-USD');
      cy.selectStrategy('HFT-Market-Maker');
      
      cy.get('[data-testid="order-book"]').should('be.visible');
      cy.get('[data-testid="chart-container"]').matchImageSnapshot('price-chart');
      
      cy.placeOrder({
        type: 'LIMIT',
        side: 'BUY',
        amount: '100000',
        leverage: 50
      });
  
      cy.get('[data-testid="order-status"]').should('contain', 'EXECUTED');
      cy.verifyOrderInPositionList();
    });
  });