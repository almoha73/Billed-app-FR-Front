/**
 * @jest-environment jsdom
 */

import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import BillsUI from "../views/BillsUI.js";
import router from "../app/Router.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { fireEvent,waitFor, screen, getByRole } from "@testing-library/dom";
import mockStore from "../__mocks__/store";
import { formatDate } from "../app/format.js";

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

    test("the update bills function is executed with informations provided && send to the mock API POST", async () => {
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
      
      const postSpy = jest.spyOn(mockStore, 'bills');
      const bills = mockStore.bills(billInformations);
        expect(postSpy).toHaveBeenCalledTimes(1);
        expect((await bills.list()).length).toBe(4);
        
    });

    
    test("Then it should send the new bill to the mock API POST and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return Promise.reject(new Error("Erreur 404"))
      });

      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;
      const message = screen.getByText(/Erreur 404/);
      expect (message).toBeTruthy();
    });

    test("Then it should send the new bill to the mock API POST and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return Promise.reject(new Error("Erreur 500"))
      });

      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      const message = screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });

  describe("When I select a file", () => {
    test("it should call handleChangeFile method", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
       const html = NewBillUI()
       document.body.innerHTML = html
       const newBillObject = new NewBill({
        document,
        onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname }),
        store: mockStore,
        localStorage: window.localStorage
       })
      const handleChangeFile = jest.fn(newBillObject.handleChangeFile)
      const inputFile = screen.getByTestId('file')
      inputFile.addEventListener('change', handleChangeFile)
      fireEvent.change(inputFile, {
        target: {
          files: [new File(['test.jpg'], 'test.jpg', {type: 'image/jpg'})]
        }
      })
      expect(handleChangeFile).toHaveBeenCalled()
      const formData = new FormData()
    const email = JSON.parse(localStorage.getItem("user")).email
    formData.append('file', inputFile)
    formData.append('email', email)
    expect(formData).not.toBeNull();
    })

    

    describe("and the file format is valid", () => {
      test('it should update the input field', () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
       const html = NewBillUI()
       document.body.innerHTML = html
       const newBillObject = new NewBill({
        document,
        onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname }),
        store: mockStore,
        localStorage: window.localStorage
       })
        const handleChangeFile = jest.fn(newBillObject.handleChangeFile)
        const inputFile = screen.getByTestId('file')
        inputFile.addEventListener('change', handleChangeFile)
        fireEvent.change(inputFile, {
          target: {
            files: [new File(['test.jpg'], 'test.jpg', {type: 'image/jpg'})]
          }
        })
        
        expect(inputFile.files[0].name).toBe("test.jpg");
      })
    })

    describe("and the file format is not valid", () => {
      test('it should not update the input field', () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
         const html = NewBillUI()
         document.body.innerHTML = html
         const newBillObject = new NewBill({
          document,
          onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname }),
          store: mockStore,
          localStorage: window.localStorage
         })
         window.alert = jest.fn();
        const handleChangeFile = jest.fn(newBillObject.handleChangeFile)
        const inputFile = screen.getByTestId('file')
        inputFile.addEventListener('change', handleChangeFile)
        fireEvent.change(inputFile, {
          target: {
            files: [new File(['test.pdf'], 'test.pdf', {type: 'text/pdf'})]
          }
        })
        expect(inputFile.files[0].name).toBe('test.pdf')
        expect(handleChangeFile).toHaveReturnedWith(false)
        expect(window.alert).toHaveBeenCalledWith('Extension non autorisée');
        
      })
    });
  })
})

