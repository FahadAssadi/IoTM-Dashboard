namespace IoTM.Dtos
{
    public class PagedResult<T>
    {
        public required int Page { get; set; }
        public required int PageSize { get; set; }
        public required int TotalCount { get; set; }
        public required List<T> Items { get; set; } = new();
    }
}