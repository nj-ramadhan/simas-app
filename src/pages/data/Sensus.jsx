import DataModulePage from './DataModulePage';
import { MODULES } from '../../config/modules';

export default function Sensus() {
  return <DataModulePage config={MODULES.sensus} />;
}
