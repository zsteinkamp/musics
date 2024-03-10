type DirLinksProps = {
  dirLinks: JSX.Element[]
  className: String
};

const DirLinks = ({
  dirLinks,
  className = "",
}: DirLinksProps): JSX.Element | null => {
  return (
    <div className={`relative ${className}`}>
      <div className="
        md:min-h-[80vh] truncate md:sticky md:top-4
        font-header
      text-headertext-light dark:text-headertext-dark
       ">
        {dirLinks}
      </div>
    </div>
  )
}

export default DirLinks