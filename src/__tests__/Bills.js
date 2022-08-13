/**
 * @jest-environment jsdom
 */
 import {screen, waitFor} from "@testing-library/dom"
 import userEvent from '@testing-library/user-event'
 import BillsUI from "../views/BillsUI.js"
 import Bills from "../containers/Bills"
 import mockStore from "../__mocks__/store"
 import { bills } from "../fixtures/bills.js"
 import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
 import {localStorageMock} from "../__mocks__/localStorage.js";
 
 import router from "../app/Router.js";
 jest.mock("../app/Store", () => mockStore)


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
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
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({
        data: bills,
      });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    test("there is an iconeye button displayed", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      expect(screen.getAllByTestId("icon-eye")).toBeDefined();
    });

    test("there is a new bill button displayed", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      expect(screen.getByTestId("btn-new-bill")).toBeDefined();
    });

    describe("when I click the eye icon", () => {
      test("a modal must open", () => {
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );
        $.fn.modal = jest.fn();
          
        document.body.innerHTML = BillsUI({ data: [bills[0]] });

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const store = mockStore;

        const theBills = new Bills({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });

        const iconEye = screen.getByTestId("icon-eye");
        const handleClickIconEyeMoked = jest.fn(theBills.handleClickIconEye);

        iconEye.addEventListener("click", () =>
          handleClickIconEyeMoked(iconEye)
        );

        userEvent.click(iconEye);
        expect(handleClickIconEyeMoked).toHaveBeenCalled();
        const modale = document.getElementById("modaleFile");
        expect(modale).toBeTruthy();
      });
    
      describe("When i click on the close button", () => {
        test("the modal can be closed", () => {
          const modale = document.getElementById("modaleFile");
          const close = document.querySelector(".close");
          close.addEventListener("click", () => {
            expext(modale).toBeFalsy();
          });
        });
      });
    })
    describe("When i click on the newbill button", () => {
      test("it should display the newbill page", () => {
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        document.body.innerHTML = BillsUI({ data: [bills[0]] });

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const store = mockStore;

        const theBills = new Bills({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });

        const newBillButton = screen.getByTestId("btn-new-bill");
        const handleClickNewBill = jest.fn(theBills.handleClickNewBill);
        newBillButton.addEventListener("click", () =>
          handleClickNewBill(newBillButton)
        );
        userEvent.click(newBillButton);
        expect(handleClickNewBill).toHaveBeenCalled();
        
      });
    });

    
  });
});

describe("When I navigate to Bills", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })

    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      await waitFor(() => screen.getByText(/Erreur 404/))
      const message = screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches bills from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      await waitFor(() => screen.getByText(/Erreur 500/))
      const message = screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })

  })
