import Surgeries from "./pages/Surgeries";
import Register from "./pages/Register";
import SurgeryForm from "./pages/SurgeryForm";
import StageForm from "./pages/StageForm";
import ViewStage from "./pages/ViewStage";

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
    path: "/surgery/:stage/enrollment/:enrollment/tei/:trackedEntityInstance",
    component: StageForm,
  },
  {
    path: "/surgery/:stage/enrollment/:enrollment/tei/:trackedEntityInstance/edit",
    component: StageForm,
  },
  {
    path: "/surgery/:stage/enrollment/:enrollment/tei/:trackedEntityInstance/view",
    component: ViewStage,
  },
];

export default routes;
