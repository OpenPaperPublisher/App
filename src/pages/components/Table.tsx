const Table = ({ children, headers }: any) => (
    <div className="w-full mb-8 overflow-hidden rounded-lg shadow-xs">
        <div className="w-full overflow-x-auto">
            <table className="w-full whitespace-no-wrap">
                <thead>
                    {headers.map((name: any) => (
                        <tr
                            key={name}
                            className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b bg-gray-50"
                        >
                            <th className="px-4 py-3">{name}</th>
                        </tr>
                    ))}
                </thead>
                <tbody className="bg-white divide-y">{children}</tbody>
            </table>
        </div>
    </div>
);

export default Table;
