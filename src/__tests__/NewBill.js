/**
 * @jest-environment jsdom
 */
 import {localStorageMock} from "../__mocks__/localStorage.js";
import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import router from "../app/Router.js";
import {ROUTES_PATH} from "../constants/routes.js";import {waitFor} from '@testing-library/dom'


  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted ", async () => {
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
      const windowIcon = screen.getByTestId('icon-mail')
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    })
  })


