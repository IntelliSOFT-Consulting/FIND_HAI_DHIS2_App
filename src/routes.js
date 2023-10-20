import Surgeries from "./pages/Surgeries";
import Register from "./pages/Register";
import SurgeryForm from "./pages/SurgeryForm";
import StageForm from "./pages/StageForm";

const routes = [
  {
    path: "/surgeries",
    component: Surgeries,
  },
  {
    path: "/forms/:instanceId/:programStageId",
  },
  {
    path: "/register",
    component: Register,
  },
  {
    path: "/surgery/:trackedEntityInstance/:enrollment",
    component: SurgeryForm,
  },
  {
    path: "/surgery/:stage/event/:event",
    component: StageForm,
  },
  {
    path: "/surgery/:stage/event/:event/edit",
    component: StageForm,
  },
];

export default routes;
