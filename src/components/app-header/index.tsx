interface AppHeaderProps {
    children: React.ReactNode
}
export default function AppHeader(props : AppHeaderProps){
    return (
        <header className="w-full flex items-center p-2 bg-gray-50 border-b border-gray-200">
            {props.children}
        </header>
    )
}