/**
 * @jest-environment jsdom
 */
 import {screen, waitFor} from "@testing-library/dom"
 import userEvent from '@testing-library/user-event'
 import NewBillUI from "../views/NewBillUI.js"
 import NewBill from "../containers/NewBill.js"
 import {localStorageMock} from "../__mocks__/localStorage.js";
 import mockStore from "../__mocks__/store"
 import router from "../app/Router"
 import {ROUTES_PATH} from "../constants/routes.js";
 
 jest.mock("../app/Store", () => mockStore)

describe("When I am on NewBill Page", async () => {
  test("Then mail icon in vertical layout should be highlighted and the mail icon should'nt be highlightened", async () => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
    router()
    window.onNavigate(ROUTES_PATH['NewBill'])
    await waitFor(() => screen.getByTestId('icon-mail'))
    await waitFor(() => screen.getByTestId('icon-window'))
    const mailIcon = screen.getByTestId('icon-mail')
    const windowIcon = screen.getByTestId('icon-window')
    //to-do write expect expression
    expect(mailIcon.classList.contains("active-icon")).toBe(true);
    expect(windowIcon.classList.contains("active-icon")).toBe(false);
  })
  
})
  
  // test d'intégration GET
describe("Given I am a user connected as Employee", () => {
    describe("When I navigate to NewBill page", () => {
      test("fetches newbills from mock API GET", async () => {
        localStorage.setItem("user", JSON.stringify({ type: "Employee", email: 'test@test.test' }));
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.NewBill)
        await waitFor(() => screen.getByText("Envoyer une note de frais"))
        
      })
      
    
      
    })

  
})
