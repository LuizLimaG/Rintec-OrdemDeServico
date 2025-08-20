interface AppHeaderProps {
    children: React.ReactNode
}
export default function AppHeader(props : AppHeaderProps){
    return (
        <header className="w-full flex items-center p-3 bg-gray-50 border-b border-gray-200 print:hidden">
            {props.children}
        </header>
    )
}