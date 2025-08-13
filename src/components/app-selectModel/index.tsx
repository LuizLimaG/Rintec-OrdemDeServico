import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface AppSelectModelProps {
  value?: any;
  onChange: (value: any) => void;
}

export default function AppSelectModel(props: AppSelectModelProps) {
  console.log("AppSelectModel props:", props)
  
  return (
    <Select
      value={props.value}
      onValueChange={(value) => {
        console.log("Select onValueChange:", value)
        props.onChange(value);
      }}
    >
      <SelectTrigger className="max-w-[400px] w-full">
        <SelectValue placeholder="Selecione o modelo" />
      </SelectTrigger>
      <SelectContent>
        {/* <SelectGroup>
          <SelectLabel>Área Comum-(AC)</SelectLabel>
          <SelectItem value="-">-</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Serviços Brutos-(SB)</SelectLabel>
          <SelectItem value="-">-</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Serviços Finos-(SF)</SelectLabel>
          <SelectItem value="-">-</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Kits Pré-Montados-(KP)</SelectLabel>
          <SelectItem value="-">-</SelectItem>
        </SelectGroup> */}
        <SelectGroup>
          <SelectLabel>Testes</SelectLabel>
          <SelectItem value="TS-00">TS-00</SelectItem>
          <SelectItem value="TS-01">TS-01</SelectItem>
          <SelectItem value="TS-02">TS-02</SelectItem>
          <SelectItem value="Sem padrão">Sem padrão</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}