import { OmitType } from "@nestjs/mapped-types";
import { BookDto } from "./book.dto";

export class CreateBookDto extends OmitType(BookDto, ["id"]) { }
