/**
 * @jest-environment jsdom
 */
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import router from "../app/Router.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { waitFor, screen, getByRole } from "@testing-library/dom";


describe("When I am on NewBill Page", () => {
  test("Then mail icon in vertical layout should be highlighted ", async () => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    router();
    window.onNavigate(ROUTES_PATH["NewBill"]);
    await waitFor(() => screen.getByTestId("icon-mail"));
    const windowIcon = screen.getByTestId("icon-mail");
    //to-do write expect expression
    expect(windowIcon.classList.contains("active-icon")).toBe(true);
  });

  describe("when i click on the submit button", () => {
    test("the handleSubmit function is called", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      window.onNavigate(ROUTES_PATH["NewBill"]);
      const store = null;
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage,
      });
      const btnSendBill = screen.getByTestId("form-new-bill");

      const handleSubmitMock = jest.fn((e) => newBill.handleSubmit(e));

      btnSendBill.addEventListener("submit", handleSubmitMock);
      userEvent.click(getByRole(document.body, "button"));
      expect(handleSubmitMock).toBeCalled();
    });

    test("the update bills function is executed with informations provided", () => {
      document.body.innerHTML = NewBillUI()
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const onNavigate = jest.fn()
      const store = null;

      const newBillObject = new NewBill({
        document,
        onNavigate,
        store,
        localStorage,
      });

      
      const billInformations = {
        type: "Transports",
        name: "Bordeaux",
        date: "2022-08-15",
        amount: 100,
        vat: "20",
        pct: 20,
        commentary: "test",
        fileUrl: "C:/Users/beaum/OneDrive/Images/Saved Pictures/wallpapertip_4k-wallpaper_2602.jpg",
        fileName: null,
        status: "pending",
      }
      newBillObject.updateBill = jest.fn()

      screen.getByTestId('amount').value = billInformations.amount
      screen.getByTestId('expense-name').value = billInformations.name
      screen.getByTestId('expense-type').value = billInformations.type
      screen.getByTestId('datepicker').value = billInformations.date
      screen.getByTestId('vat').value = billInformations.vat
      screen.getByTestId('pct').value = billInformations.pct
      screen.getByTestId('commentary').value = billInformations.commentary

      userEvent.click(screen.getByTestId("btn-send-bill"))
      expect(newBillObject.updateBill(billInformations)).toBeCalled
      
    });
  });
});
