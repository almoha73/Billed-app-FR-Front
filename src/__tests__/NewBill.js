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
import { fireEvent, waitFor, screen, getByRole } from "@testing-library/dom";
import mockStore from "../__mocks__/store";
import store from "../__mocks__/store";
import { bills } from "../fixtures/bills.js"



describe("When I am on NewBill Page", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
          email: "employee@test-td",
          password: "employee",
          status: "connected",
      })
    );
    const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
  });
  test("Then mail icon in vertical layout should be highlighted ", async () => {
    
    window.onNavigate(ROUTES_PATH["NewBill"]);
    await waitFor(() => screen.getByTestId("icon-mail"));
    const windowIcon = screen.getByTestId("icon-mail");
    expect(windowIcon.classList.contains("active-icon")).toBe(true);
   
  });

  test("Then it should show the new bill form", () => {
    const html = NewBillUI();
    document.body.innerHTML = html;

    expect(screen.getByTestId("form-new-bill")).toBeTruthy();
  });

  describe("when i click on the submit button", () => {
    test("the handleSubmit function is called", () => {
      
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = pathname => {
        const html = ROUTES({ pathname, data: [] });
        document.body.innerHTML = html;
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: null,
      });
      const btnSendBill = screen.getByTestId("form-new-bill");

      const handleSubmitMock = jest.fn((e) => newBill.handleSubmit(e));
      btnSendBill.addEventListener("submit", handleSubmitMock);
      fireEvent.submit(btnSendBill);
      expect(handleSubmitMock).toHaveBeenCalled();
      expect(screen.getByText("Mes notes de frais")).toBeTruthy;
    });

    test("the update bills function is executed with informations provided && send to the mock API POST", async () => {
      document.body.innerHTML = NewBillUI()
      
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
        
        await onNavigate(ROUTES_PATH['Bills'])
        
        expect(onNavigate).toBeCalledWith(ROUTES_PATH['Bills'])
        
    });

    
    test("Then it should send the new bill to the mock API POST and fails with 404 message error", async () => {
      console.error = jest.fn()
      document.body.innerHTML = NewBillUI()
      mockStore.bills.mockImplementationOnce(() => {
        return {
          update : () =>  {
            return waitFor(()=>Promise.reject(new Error("Erreur 404")))
          }
        }})
        
        window.onNavigate(ROUTES_PATH.NewBill); 
      const store = null;

      const newBillObject = new NewBill({
        document,
        onNavigate,
        store,
        localStorage,
      });
      
       const formNewBill = screen.getByTestId("form-new-bill")
       const handleSubmit = jest.fn((e) => newBillObject.handleSubmit(e))
       formNewBill.addEventListener("submit", handleSubmit)
       fireEvent.submit(formNewBill)
       expect(handleSubmit).toHaveBeenCalled()
       await new Promise(process.nextTick)
       expect(console.error).toHaveBeenCalled()
      })

    test("Then it should send the new bill to the mock API POST and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        list : () =>  {
          return Promise.reject(new Error("Erreur 500"))
        }
      });
      
      window.onNavigate(ROUTES_PATH.Bills)
       await new Promise(process.nextTick);
      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      const message = screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
      console.error = jest.fn()
      expect.assertions(1);
      try{
        await mockStore.bills
      }catch{
        expect (error).toEqual(console.error)
      }
    });
  });
})


  describe("When I select a file and the file format is valid", () => {
      test('it should update the input field', () => {
        
        const html = NewBillUI()
        document.body.innerHTML = html
        const newBillObject = new NewBill({
         document,
         onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname }),
         store: mockStore,
         localStorage: window.localStorage
        })
       const handle = jest.fn((e) => newBillObject.handleChangeFile(e))
       const inputFile = screen.getByTestId('file')
       const img = new File(['img'], 'image.png', {type:'image/png'})
       
       inputFile.addEventListener('change', (e) => {
           handle(e)
       })
       userEvent.upload(inputFile, img)
       
       
       expect(handle).toHaveBeenCalled()
       expect(inputFile.files[0]).toStrictEqual(img)
        expect(inputFile.files[0].name).toBe('image.png')
     
      
      })

      test('formData not to be null', () => {
      
        const html = NewBillUI()
        document.body.innerHTML = html
        const newBillObject = new NewBill({
         document,
         onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname }),
         store: jest.fn(),
         localStorage: window.localStorage
        })
        
       const handle = jest.fn((e) => newBillObject.handleChangeFile(e))
       const inputFile = screen.getByTestId('file')
       const img = new File(['img'], 'image.png', {type:'image/png'})
      
       inputFile.addEventListener('change', (e) => {
           handle(e)
       })
       userEvent.upload(inputFile, img)
       const formData = new FormData()
        const email = JSON.parse(localStorage.getItem("user")).email
       formData.append('file', inputFile)
       formData.append('email', email)
       expect(formData).not.toBe(null)
       
      })
})

describe("When I select a file and the file format is not valid", () => {
      test('it should not update the input field',  () => {
        
         const html = NewBillUI()
         document.body.innerHTML = html
         const newBillObject = new NewBill({
          document,
          onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname }),
          store: mockStore,
          localStorage: window.localStorage
         })
         window.alert = jest.fn();
         
        const handle = jest.fn((e) => newBillObject.handleChangeFile(e))
        const inputFile = screen.getByTestId('file')
        
        inputFile.addEventListener('change', (e) => {
          handle(e)
        })
        const file = new File(['img'], 'test.pdf', {type:'application/pdf'})
        userEvent.upload(inputFile, file)
        expect(handle).toHaveBeenCalled()
        
       expect(inputFile.files[0]).toStrictEqual(file)
        expect(inputFile.files[0].name).toBe('test.pdf')
        expect(window.alert).toBeCalled()
        
        
        
      })
    
  })




