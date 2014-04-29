describe("OrderUtil", function() {
	describe("latest", function() {
		it("should return latest orders in preserving sequence", function() {
			var order1 = {concept: {name: 'A'}, dateCreated: "2014-04-01"};
			var order2 = {concept: {name: 'A'}, dateCreated: "2014-04-02"};
			var order3 = {concept: {name: 'B'}, dateCreated: "2014-04-01"};
			var orders = [order1, order2, order3];

			var latestOrders = Bahmni.Clinical.OrdersUtil.latest(orders);

			expect(orders.length).toBe(3);
			expect(latestOrders.length).toBe(2);
			expect(latestOrders).toEqual([order2, order3]);
		});
	});
});