import { assert, expect } from "chai";
import "mocha";
import { PanoptykDate } from "./panoptykDateTime";

describe("Panoptyk date/time", () => {
  beforeEach(() => {});
  context("time conversions", () => {
    it("irl <-> panoptyk time", () => {
      // conversion is 1 irl hour = 1 panoptyk day
      const irlR = 123; // real
      const ptR = 123 * 24; // real
      const pt = PanoptykDate.toPanoptykTime(irlR);
      const irl = PanoptykDate.toIRLTime(ptR);

      assert.equal(irl, irlR);
      assert.equal(pt, ptR);

      const now = Date.now();
      assert.equal(now, PanoptykDate.toIRLTime(PanoptykDate.toPanoptykTime(now)));
    });
  });
});
