import DataModulePage from './DataModulePage';
import { MODULES } from '../../config/modules';

export default function Perusahaan() {
  return <DataModulePage config={MODULES.perusahaan} />;
}
