# RFP Tool

The RFP Tool app provides the Proposal Management workflow for creating, building, reviewing, and requesting quotes for proposal drafts inside Platform UI.

## Main areas

- Proposal list sidebar with proposal selection and creation
- Build workflow with documents, RFP summary, clarifying questions, and context timer
- Review workflow with proposal output display and quote request state

## Local usage

- Start Platform UI with `yarn start`
- Open `https://local.topcoder-dev.com/rfp-tool`

## Key files

- Routes: [src/rfp-tool.routes.tsx](./src/rfp-tool.routes.tsx)
- Main page: [src/pages/RfpToolPage.tsx](./src/pages/RfpToolPage.tsx)
- Services: [src/lib/services/proposals.service.ts](./src/lib/services/proposals.service.ts)
- Mock data and handlers: [src/lib/mock/proposals.mock.ts](./src/lib/mock/proposals.mock.ts)
